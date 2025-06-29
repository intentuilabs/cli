import { Args, Command, Options } from "@effect/cli"
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
  Command as RawCommand,
} from "@effect/platform"
import chalk from "chalk"
import { Console, Effect, Schema, pipe } from "effect"
import { REGISTRY_URL } from "~/consts"
import { Component } from "~/schema/component"

export const componentNames = Args.text({ name: "componentNames" }).pipe(Args.repeated)

export const isBlock = Options.boolean("b")
export const isStyle = Options.boolean("s")
export const allComponents = Options.boolean("all").pipe(
  Options.withAlias("a"),
  Options.withDefault(false),
)
export const overwrite = Options.boolean("overwrite").pipe(
  Options.withAlias("o"),
  Options.withDefault(false),
)
export const componentType = Options.choice("type", ["ui", "block", "style", "lib", "hook"]).pipe(
  Options.withAlias("t"),
  Options.withDefault("ui"),
)

export const addCommand = Command.make(
  "add",
  { componentNames, isBlock, isStyle, componentType, allComponents, overwrite },
  ({ componentNames, isBlock, isStyle, componentType, allComponents, overwrite }) =>
    Effect.gen(function* () {
      const type = isBlock ? "block" : isStyle ? "style" : componentType
      if (!allComponents && componentNames.length === 0) {
        yield* Console.log(chalk.red("No components selected"))
        yield* Console.log(chalk.red("Please select a component or use --all"))
        return
      }

      if (allComponents) {
        const client = yield* HttpClient.HttpClient.pipe()
        const response = yield* HttpClientRequest.get("https://intentui.com/r/index.json").pipe(
          client.execute,
          Effect.flatMap(HttpClientResponse.schemaBodyJson(Schema.Array(Component))),
        )
        const components = response.map((c) => `${REGISTRY_URL}/r/${c.name}.json`)
        const args = ["add"]
        if (overwrite) args.push("--overwrite")
        args.push(...components)
        return yield* pipe(
          RawCommand.make("shadcnClone", ...args).pipe(
            RawCommand.stdin("inherit"),
            RawCommand.stdout("inherit"),
            RawCommand.stderr("inherit"),
            RawCommand.exitCode,
          ),
        )
      }

      const manualOverwrite =
        overwrite || componentNames.includes("--overwrite") || componentNames.includes("-o")

      const cleanedComponentNames = componentNames.filter(
        (name) => name !== "--overwrite" && name !== "-o",
      )

      const componentPaths = yield* pipe(
        Effect.forEach(cleanedComponentNames, (name) =>
          Effect.succeed(name.startsWith("http") ? name : `${REGISTRY_URL}/r/${type}-${name}.json`),
        ),
      )

      const args = ["add"]
      if (manualOverwrite) {
        args.push("--overwrite")
      }
      args.push(...componentPaths)

      return yield* pipe(
        RawCommand.make("shadcnClone", ...args).pipe(
          RawCommand.stdin("inherit"),
          RawCommand.stdout("inherit"),
          RawCommand.stderr("inherit"),
          RawCommand.exitCode,
        ),
      )
    }),
).pipe(Command.withDescription("Adds UI components or blocks to your project."))

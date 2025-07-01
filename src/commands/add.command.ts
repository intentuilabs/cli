import { Args, Command, Options } from "@effect/cli"
import * as FileSystem from "@effect/platform/FileSystem"

import * as Path from "node:path"
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
  Command as RawCommand,
} from "@effect/platform"
import chalk from "chalk"
import { Console, Effect, Schema, pipe } from "effect"
import { REGISTRY_URL } from "~/consts"
import { applyUserAliases } from "~/lib/apply-user-aliases"
import {
  isLaravel,
  isNextWithSrc,
  isNextWithoutSrc,
  isRemix,
} from "~/lib/check-current-user-project"
import { walkFiles } from "~/lib/walk-files"
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

      const exitCode = yield* pipe(
        RawCommand.make("shadcnClone", ...args).pipe(
          RawCommand.stdin("inherit"),
          RawCommand.stdout("inherit"),
          RawCommand.stderr("inherit"),
          RawCommand.exitCode,
        ),
      )

      if (exitCode === 0) {
        const fileSystem = yield* FileSystem.FileSystem

        const userConfigPath = Path.resolve(process.cwd(), "components.json")
        const userConfigRaw = yield* fileSystem.readFileString(userConfigPath)
        const userConfig = JSON.parse(userConfigRaw)

        const cwd = process.cwd()

        const hasSrc = yield* Effect.promise(() => isNextWithSrc(cwd))
        const noSrc = yield* Effect.promise(() => isNextWithoutSrc(cwd))
        const isRemixApp = yield* Effect.promise(() => isRemix(cwd))
        const isLaravelApp = yield* Effect.promise(() => isLaravel(cwd))

        function resolveAliasPath(aliasPath: string): string {
          const base =
            isLaravelApp || noSrc ? cwd : hasSrc || isRemixApp ? Path.join(cwd, "src") : cwd

          return Path.resolve(aliasPath.replace(/^@\//, `${base}/`))
        }

        const foldersToPatch = Object.values(userConfig.aliases as Record<string, string>)
          .filter((dir) => typeof dir === "string" && dir.startsWith("@/"))
          .map((aliasPath) => resolveAliasPath(aliasPath))

        for (const folder of foldersToPatch) {
          const exists = yield* fileSystem.exists(folder)
          if (!exists) continue

          const allFiles = yield* walkFiles(fileSystem, folder)

          for (const file of allFiles) {
            const fullPath = Path.join(folder, file)
            if (!fullPath.endsWith(".tsx")) continue

            const raw = yield* fileSystem.readFileString(fullPath)
            const updated = applyUserAliases(raw, userConfig.aliases)

            if (updated !== raw) {
              yield* fileSystem.writeFile(fullPath, Buffer.from(updated))
            }
          }
        }

      }

      return exitCode
    }),
).pipe(Command.withDescription("Adds UI components or blocks to your project."))

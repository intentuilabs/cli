import { Args, Command, Options } from "@effect/cli"
import { Effect, Schema, pipe } from "effect"
import { REGISTRY_URL } from "~/consts"

import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
  Command as RawCommand,
} from "@effect/platform"
import { Component } from "~/schema/component"

export const componentNames = Args.text({ name: "componentNames" }).pipe(Args.repeated)

export const isBlock = Options.boolean("b")
export const isStyle = Options.boolean("s")

export const allComponents = Options.boolean("all").pipe(
  Options.withAlias("a"),
  Options.withDefault(false),
)

export const componentType = Options.choice("type", ["ui", "block", "style"]).pipe(
  Options.withAlias("t"),
  Options.withDefault("ui"),
)

export const addCommand = Command.make(
  "add",
  { componentNames, isBlock, isStyle, componentType, allComponents },
  ({ componentNames, isBlock, isStyle, componentType, allComponents }) =>
    Effect.gen(function* () {
      const type = isBlock ? "block" : isStyle ? "style" : componentType

      const componentPaths = yield* pipe(
        Effect.forEach(componentNames, (name) =>
          Effect.succeed(`${REGISTRY_URL}/r/${type}-${name}.json`),
        ),
      )

      if (allComponents) {
        const client = yield* HttpClient.HttpClient.pipe()

        const response = yield* HttpClientRequest.get("http://localhost:3000/r/index.json").pipe(
          client.execute,
          Effect.flatMap(HttpClientResponse.schemaBodyJson(Schema.Array(Component))),
        )

        return yield* RawCommand.make(
          "shadcnClone",
          "add",
          ...response.map((c) => `https://intentui.com/r/${c.name}.json`),
        ).pipe(
          RawCommand.stdin("inherit"),
          RawCommand.stdout("inherit"),
          RawCommand.stderr("inherit"),
          RawCommand.exitCode,
        )
      }

      return yield* pipe(
        RawCommand.make("shadcnClone", "add", ...componentPaths).pipe(
          RawCommand.stdin("inherit"),
          RawCommand.stdout("inherit"),
          RawCommand.stderr("inherit"),
          RawCommand.exitCode,
        ),
      )
    }),
).pipe(Command.withDescription("Adds UI components or blocks to your project."))

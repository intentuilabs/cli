import { Args, Command, Options } from "@effect/cli"
import { Effect, pipe } from "effect"
import { REGISTRY_URL } from "~/consts"

import { Command as RawCommand } from "@effect/platform"

export const componentNames = Args.text({ name: "componentNames" }).pipe(Args.repeated)

export const isBlock = Options.boolean("b")
export const isStyle = Options.boolean("s")

export const componentType = Options.choice("type", ["ui", "block", "style"]).pipe(
  Options.withAlias("t"),
  Options.withDefault("ui"),
)

export const addCommand = Command.make(
  "add",
  { componentNames, isBlock, isStyle, componentType },
  ({ componentNames, isBlock, isStyle, componentType }) =>
    Effect.gen(function* () {
      const type = isBlock ? "block" : isStyle ? "style" : componentType

      const componentPaths = yield* pipe(
        Effect.forEach(componentNames, (name) =>
          Effect.succeed(`${REGISTRY_URL}/r/${type}-${name}.json`),
        ),
      )
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

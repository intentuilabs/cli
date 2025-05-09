import { Args, Command, Options } from "@effect/cli"
import { Effect } from "effect"
import { REGISTRY_URL } from "~/consts"

import { Command as RawCommand } from "@effect/platform"

export const componentNames = Args.text({ name: "componentNames" }).pipe(Args.repeated)

export const componentType = Options.choice("type", ["ui", "block", "style"]).pipe(
  Options.withDefault("ui"),
)

export const addCommand = Command.make("add", { componentNames, componentType }, (config) =>
  Effect.gen(function* () {
    const componentPaths = yield* Effect.forEach(config.componentNames, (name) =>
      Effect.succeed(`${REGISTRY_URL}/r/${config.componentType}-${name}.json`),
    )

    const exitCode = yield* RawCommand.make("bunx", "shadcn", "add", ...componentPaths).pipe(
      RawCommand.stdin("inherit"),
      RawCommand.stdout("inherit"),
      RawCommand.stderr("inherit"),
      RawCommand.exitCode,
    )
  }),
).pipe(Command.withDescription("Adds UI components or blocks to your project."))

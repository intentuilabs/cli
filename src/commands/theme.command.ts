import { Args, Command } from "@effect/cli"
import { Effect } from "effect"
import { REGISTRY_URL } from "~/consts"

import { Command as RawCommand } from "@effect/platform"
import { resolveShadcnClone } from "~/lib/resolve-shadnc-clone"

export const theme = Args.text({ name: "theme" })

export const themeCommand = Command.make("theme", { theme }, (config) =>
  Effect.gen(function* () {
    const themePath = `${REGISTRY_URL}/r/style/${config.theme}`

    const exitCode = yield* RawCommand.make("node", resolveShadcnClone(), "add", themePath).pipe(
      RawCommand.stdin("inherit"),
      RawCommand.stdout("inherit"),
      RawCommand.stderr("inherit"),
      RawCommand.exitCode,
    )
  }),
).pipe(Command.withDescription("Adds UI components or blocks to your project."))

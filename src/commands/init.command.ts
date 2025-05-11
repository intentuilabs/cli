import { Command } from "@effect/cli"
import { Effect } from "effect"

import { Command as RawCommand } from "@effect/platform"
import { REGISTRY_URL } from "~/consts"

import { BunCommandExecutor } from "@effect/platform-bun"

const shadcnInit = RawCommand.make("shadcnClone", "init", `${REGISTRY_URL}/r/default.json`).pipe(
  RawCommand.stdin("inherit"),
  RawCommand.stdout("inherit"),
  RawCommand.stderr("inherit"),
)

export const initCommand = Command.make("init", {}, () =>
  Effect.gen(function* () {
    const results = yield* RawCommand.exitCode(shadcnInit)
  }).pipe(Effect.scoped, Effect.provide(BunCommandExecutor.layer)),
).pipe(Command.withDescription("Initializes the project and sets up necessary configurations."))

import { Command } from "@effect/cli"
import { Console, Effect } from "effect"

import { FileSystem, Command as RawCommand } from "@effect/platform"
import { REGISTRY_URL } from "~/consts"

import { BunCommandExecutor } from "@effect/platform-bun"

const shadcnInit = RawCommand.make("shadcnClone", "init", `${REGISTRY_URL}/r/default.json`).pipe(
  RawCommand.stdin("inherit"),
  RawCommand.stdout("inherit"),
  RawCommand.stderr("inherit"),
)

export const initCommand = Command.make("init", {}, () =>
  Effect.gen(function* () {
    const fileSyt = yield* FileSystem.FileSystem

    const hasIntentUiConfig = yield* fileSyt.exists("intentui.json")
    const hasComponentJson = yield* fileSyt.exists("component.json")

    if (hasIntentUiConfig && !hasComponentJson) {
      yield* Console.log("Migrating to new config format...")
    }

    const results = yield* RawCommand.exitCode(shadcnInit)
  }).pipe(Effect.scoped, Effect.provide(BunCommandExecutor.layer)),
).pipe(Command.withDescription("Initializes the project and sets up necessary configurations."))

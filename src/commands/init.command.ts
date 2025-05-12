import { Command } from "@effect/cli"
import { Console, Effect } from "effect"

import { FileSystem, Command as RawCommand } from "@effect/platform"
import { REGISTRY_URL } from "~/consts"

import { NodeCommandExecutor } from "@effect/platform-node"

const shadcnInit = RawCommand.make("shadcnClone", "init", `${REGISTRY_URL}/r/default.json`).pipe(
  RawCommand.stdin("inherit"),
  RawCommand.stdout("inherit"),
  RawCommand.stderr("inherit"),
)

export const initCommand = Command.make("init", {}, () =>
  Effect.gen(function* () {
    const fileSytem = yield* FileSystem.FileSystem

    const hasIntentUiConfig = yield* fileSytem.exists("intentui.json")
    const hasComponentJson = yield* fileSytem.exists("component.json")

    if (hasIntentUiConfig && !hasComponentJson) {
      yield* Console.log("Migrating to new config format...")
    }

    const results = yield* RawCommand.exitCode(shadcnInit)
  }).pipe(Effect.scoped, Effect.provide(NodeCommandExecutor.layer)),
).pipe(Command.withDescription("Initializes the project and sets up necessary configurations."))

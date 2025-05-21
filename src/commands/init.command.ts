import { Command } from "@effect/cli"
import { Console, Effect } from "effect"
import { Command as RawCommand, FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"

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

    const componentsJsonPath = "components.json"
    const hasIntentUiConfig = yield* fileSytem.exists("intentui.json")
    const hasComponentsJson = yield* fileSytem.exists(componentsJsonPath)

    if (hasIntentUiConfig && !hasComponentsJson) {
      yield* Console.log("Migrating to new config format...")
    }

    yield* RawCommand.exitCode(shadcnInit)
    const exists = yield* fileSytem.exists(componentsJsonPath)

    if (!exists) return

    const jsonStr = yield* fileSytem.readFileString(componentsJsonPath)
    const json = yield* Effect.try(() => JSON.parse(jsonStr))

    if (!json.tailwind?.css) return

    const cssPath = json.tailwind.css
    const cssExists = yield* fileSytem.exists(cssPath)

    if (!cssExists) return

    const content = yield* fileSytem.readFileString(cssPath)

    const lines = content.split("\n")

    const alreadyHas = (line: string) => lines.some((l) => l.trim() === line)

    const injectLines = [
      '@import "tw-animate-css";',
      '@plugin "tailwindcss-react-aria-components";',
    ].filter((line) => !alreadyHas(line))

    if (injectLines.length === 0) return

    const tailwindIndex = lines.findIndex((l) => l.trim() === '@import "tailwindcss";')

    if (tailwindIndex === -1) return

    lines.splice(tailwindIndex + 1, 0, ...injectLines)

    const patched = lines.join("\n")

    yield* fileSytem.writeFileString(cssPath, patched)

  }).pipe(
    Effect.scoped,
    Effect.provide(NodeCommandExecutor.layer),
    Effect.provide(NodeFileSystem.layer),
  ),
).pipe(Command.withDescription("Initializes the project and sets up necessary configurations."))

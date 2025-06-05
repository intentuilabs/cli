import * as FS from "node:fs/promises"
import * as Path from "node:path"
import { Command } from "@effect/cli"
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform"
import { Console, Effect } from "effect"
import { app } from "~/lib/app"

const REMOTE_BASE = app.repo.ui

function simpleDiff(local: string, remote: string): string {
  const l = local.split(/\r?\n/)
  const r = remote.split(/\r?\n/)
  const max = Math.max(l.length, r.length)
  let out = ""
  for (let i = 0; i < max; i++) {
    const a = l[i]
    const b = r[i]
    if (a !== b) {
      if (a !== undefined) out += `- ${a}\n`
      if (b !== undefined) out += `+ ${b}\n`
    }
  }
  return out
}

async function listFiles(dir: string): Promise<string[]> {
  const entries = await FS.readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const res = Path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listFiles(res)))
    } else {
      files.push(res)
    }
  }
  return files
}

export const diffCommand = Command.make("diff", {}, () =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const cwd = process.cwd()
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let config
    try {
      const jsonStr = yield* Effect.tryPromise(() => FS.readFile("components.json", "utf8"))
      config = JSON.parse(jsonStr)
    } catch {
      yield* Console.error("components.json not found or invalid")
      return
    }

    const alias: string = config.aliases?.ui ?? "components/ui"
    const uiPath = Path.isAbsolute(alias.replace(/^@\//, ""))
      ? alias.replace(/^@\//, "")
      : Path.join(cwd, alias.replace(/^@\//, ""))

    const filesResult = yield* Effect.tryPromise(() => listFiles(uiPath)).pipe(
      Effect.catchAll(() => Effect.succeed([] as string[])),
    )
    if (filesResult.length === 0) {
      yield* Console.error(`Unable to read local components at ${uiPath}`)
      return
    }
    const files = filesResult

    const diffs: Array<{ file: string; diff: string }> = []
    for (const file of files) {
      const relative = Path.relative(uiPath, file).replace(/\\/g, "/")
      const remoteUrl = `${REMOTE_BASE}/${relative}`
      const localContent = yield* Effect.tryPromise(() => FS.readFile(file, "utf8"))
      const remoteContent = yield* HttpClientRequest.get(remoteUrl).pipe(
        client.execute,
        // @ts-ignore
        Effect.flatMap(HttpClientResponse.text),
        Effect.catchAll(() => Effect.succeed("")),
      )
      if (localContent !== remoteContent) {
        // @ts-ignore
        diffs.push({ file: relative, diff: simpleDiff(localContent, remoteContent) })
      }
    }

    if (diffs.length === 0) {
      yield* Console.log("All components are up to date.")
    } else {
      for (const d of diffs) {
        yield* Console.log(`--- ${d.file} ---`)
        yield* Console.log(d.diff)
      }
      yield* Console.log(
        "Some components differ from the registry. Run 'intentui add <component>' to sync.",
      )
    }
  }),
).pipe(Command.withDescription("Compares your local components with the registry versions."))

// biome-ignore lint/style/useImportType: <explanation>
import * as FS from "@effect/platform/FileSystem"
import * as Path from "node:path"
import { Effect } from "effect"

export function walkFiles(
  fs: FS.FileSystem,
  dir: string,
): Effect.Effect<string[], unknown> {
  return Effect.gen(function* () {
    const entries = yield* fs.readDirectory(dir)
    const out: string[] = []

    for (const entry of entries) {
      const full = Path.join(dir, entry)
      const info = yield* fs.stat(full)

      if (info.type === "Directory") {
        const nested = yield* walkFiles(fs, full)
        out.push(...nested.map((f) => Path.join(entry, f)))
      } else if (info.type === "File") {
        out.push(entry)
      }
    }

    return out
  })
}

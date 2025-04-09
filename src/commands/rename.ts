import { existsSync, renameSync } from "node:fs"
import { join } from "node:path"

export const rename = () => {
  const cwd = process.cwd()
  const justdPath = join(cwd, "justd.json")
  const intentuiPath = join(cwd, "intentui.json")

  if (existsSync(justdPath)) {
    if (!existsSync(intentuiPath)) {
      renameSync(justdPath, intentuiPath)
    }
  }
}

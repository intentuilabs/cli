import * as FS from "node:fs/promises"
import * as Path from "node:path"

async function exists(p: string): Promise<boolean> {
  try {
    await FS.stat(p)
    return true
  } catch {
    return false
  }
}

export async function isNextWithSrc(dir: string): Promise<boolean> {
  const srcDir = Path.join(dir, "src")
  if (!(await exists(srcDir))) return false
  const hasPages = await exists(Path.join(srcDir, "pages"))
  const hasApp = await exists(Path.join(srcDir, "app"))
  return hasPages || hasApp
}

export async function isNextWithoutSrc(dir: string): Promise<boolean> {
  if (await exists(Path.join(dir, "src"))) return false
  const hasPages = await exists(Path.join(dir, "pages"))
  const hasApp = await exists(Path.join(dir, "app"))
  return hasPages || hasApp
}

export async function isRemix(dir: string): Promise<boolean> {
  const pkgPath = Path.join(dir, "package.json")
  if (!(await exists(pkgPath))) return false
  const pkg = JSON.parse(await FS.readFile(pkgPath, "utf-8"))
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  if (!deps || !("remix" in deps)) return false
  return await exists(Path.join(dir, "app"))
}

export async function isLaravel(dir: string): Promise<boolean> {
  const hasArtisan = await exists(Path.join(dir, "artisan"))
  const hasComposer = await exists(Path.join(dir, "composer.json"))
  return hasArtisan && hasComposer
}

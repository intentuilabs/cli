import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function resolveShadcnClone() {
  return path.resolve(__dirname, "shadcn/index.js")
}

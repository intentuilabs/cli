import * as Path from "node:path"

export function resolveShadcnClone() {
  return Path.resolve(__dirname, "../../dist/shadcn/index.js")
}

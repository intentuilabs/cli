import { Schema as S } from "effect"

export const ComponentType = S.Literal("registry:component")

export class File extends S.Class<File>("File")({
  path: S.String,
  type: ComponentType,
}) {}

export class Component extends S.Class<Component>("Registry:Component")({
  name: S.String,
  type: ComponentType,
  title: S.String,
  description: S.String,
  dependencies: S.Array(S.String),
  registryDependencies: S.Array(S.String),
  files: S.Array(File),
}) {}

export function applyUserAliases(content: string, aliases: Record<string, string>) {
  return Object.entries(aliases).reduce((updated, [alias, resolved]) => {
    const escaped = alias.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
    const regex = new RegExp(`(["'])@/${escaped}(/[^"']*)?\\1`, "g")

    return updated.replace(regex, (_match, quote, subpath = "") => {
      return `${quote}${resolved}${subpath}${quote}`
    })
  }, content)
}

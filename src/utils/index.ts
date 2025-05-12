import fs from "node:fs"
import path from "node:path"
import { isNextJs, possibilityCssPath } from "@/utils/helpers"
import { error } from "@/utils/logging"
import { confirm, input } from "@inquirer/prompts"
import { transform } from "sucrase"
import { type Config, configManager } from "./config"

// Get the path to the CSS file from the intentui.json file
export async function getCSSPath() {
  const doesConfigExist = configManager.doesConfigExist()

  if (!doesConfigExist) {
    error("Configuration file intentui.json not found. Please run the init command first.")
  }

  const config = await configManager.loadConfig()

  if (fs.existsSync(config.css)) {
    const useExistingPath = await confirm({
      message: `The specified CSS path '${config.css}' exists. Do you want to use this path?`,
    })

    if (useExistingPath) {
      return config.css
    }
  } else {
    console.warn(`The specified CSS path '${config.css}' does not exist.`)
  }

  const newCssPath = await input({
    message: "Please provide a CSS path:",
    default: possibilityCssPath(),
  })

  await configManager.updateConfig({
    css: newCssPath,
  })

  return newCssPath
}

export const writeCodeFile = async (
  config: Config,
  options: { writePath: string; ogFilename: string; content: string },
) => {
  const aliasRegex = /import\s*{.*}\s*from\s*['"]@\/(.*)['"]/g
  let parsedContent = options.content.replace(aliasRegex, (match) => {
    return match.replace("@/", `${config.alias}/`)
  })

  if (!isNextJs()) {
    parsedContent = parsedContent.replace(/['"]use client['"]\s*\n?/g, "")
  }

  const dirPath = path.dirname(options.writePath)

  fs.mkdirSync(dirPath, { recursive: true })
  if (config.language === "javascript") {
    const results = transform(parsedContent, {
      transforms: ["typescript", "jsx"],
      jsxRuntime: "preserve",
      disableESTransforms: true,
    })

    fs.writeFileSync(options.writePath.replace(".ts", ".js"), results.code, { flag: "w" })

    return
  }

  fs.writeFileSync(options.writePath, parsedContent)
}

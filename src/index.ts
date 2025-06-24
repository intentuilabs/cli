#! /usr/bin/env bun

import { Command } from "@effect/cli"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Console, Effect } from "effect"

import chalk from "chalk"
import figlet from "figlet"

import { FetchHttpClient } from "@effect/platform"
import { addCommand } from "~/commands/add.command"
import { diffCommand } from "~/commands/diff.command"
import { initCommand } from "~/commands/init.command"
import { loginCommand } from "~/commands/login.command"
import { addBlockCommand } from "./commands/block.command"
import { themeCommand } from "./commands/theme.command"

const generateFigletText = (text: string, options: figlet.Options): Effect.Effect<string, Error> =>
  Effect.async<string, Error>((resume) => {
    figlet.text(text, options, (error, data) => {
      if (error) {
        resume(Effect.fail(new Error(error.message)))
      } else if (data) {
        resume(Effect.succeed(data))
      } else {
        resume(Effect.fail(new Error("Figlet returned undefined data")))
      }
    })
  })

const rootCommand = Command.make("root", {}, () =>
  Effect.gen(function* () {
    const figletOptions: figlet.Options = {
      font: "Standard",
      horizontalLayout: "default",
    }

    const intentTextEffect = generateFigletText("Intent", figletOptions)
    const uiTextEffect = generateFigletText("UI", figletOptions)

    const [intentText, uiText] = yield* Effect.all([intentTextEffect, uiTextEffect]).pipe(
      Effect.catchAll(() => Effect.succeed([chalk.bold.cyan("Intent"), chalk.bold.magenta("UI")])),
    )

    const intentLines = intentText.split("\n")
    const uiLines = uiText.split("\n")
    const maxLength = Math.max(intentLines.length, uiLines.length)
    const isFigletOutput = intentText.includes("\n")

    for (let i = 0; i < maxLength; i++) {
      const intentLine = intentLines[i] || ""
      const uiLine = uiLines[i] || ""
      if (isFigletOutput) {
        yield* Console.log(`${chalk.bold.cyan(intentLine.padEnd(20))}${chalk.bold.magenta(uiLine)}`)
      } else {
        yield* Console.log(`${intentLine} ${uiLine}`)
      }
    }

    yield* Console.log("")
    yield* Console.log(chalk.bold.yellow("Intent UI CLI is ready to use!"))
    yield* Console.log(chalk.cyan("Run 'intentui --help' to see all available commands."))
    yield* Console.log("")
  }),
)

const command = rootCommand.pipe(
  Command.withSubcommands([
    initCommand,
    addCommand,
    diffCommand,
    loginCommand,
    themeCommand,
    addBlockCommand,
  ]),
)

const cli = Command.run(command, {
  name: "Intent UI CLI",
  version: "v2.9.0",
})

cli(process.argv).pipe(
  Effect.scoped,
  Effect.provide(NodeContext.layer),
  Effect.provide(FetchHttpClient.layer),
  NodeRuntime.runMain,
)

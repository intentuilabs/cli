#! /usr/bin/env bun

// Import necessary modules from the libraries
import { Command } from "@effect/cli"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Console, Effect } from "effect"

import { addCommand } from "~/commands/add.command"
import { diffCommand } from "~/commands/diff.command"
import { initCommand } from "~/commands/init.command"
import { loginCommand } from "~/commands/login.command"

const rootCommand = Command.make("root", {}, () =>
  Effect.gen(function* () {
    yield* Console.log("IntentUI CLI is ready to use!")
  }),
)

const command = rootCommand.pipe(
  Command.withSubcommands([initCommand, addCommand, diffCommand, loginCommand]),
)

// Set up the CLI application
const cli = Command.run(command, {
  name: "IntentUI Cli",
  version: "v0.0.1",
})

cli(process.argv).pipe(Effect.scoped, Effect.provide(BunContext.layer), BunRuntime.runMain)

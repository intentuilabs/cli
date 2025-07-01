import { Args, Command, Options } from "@effect/cli"
import { Command as RawCommand } from "@effect/platform"
import { Console, Effect, pipe } from "effect"
import { BLOCKS_REGISTRY_URL } from "~/consts"
import { resolveShadcnClone } from "~/lib/resolve-shadnc-clone"
import { getApiKey } from "./login.command"

export const blockName = Args.text({ name: "blockName" })
export const blockType = Args.text({ name: "blockType" })
export const blockCategory = Args.text({ name: "blockCategory" })

export const overwrite = Options.boolean("overwrite").pipe(
  Options.withAlias("o"),
  Options.withDefault(false),
)

export const addBlockCommand = Command.make(
  "block",
  { blockCategory, blockType, blockName, overwrite },
  ({ blockCategory, blockType, blockName, overwrite }) =>
    Effect.gen(function* () {
      const apikey = yield* getApiKey

      if (!apikey) {
        yield* Console.error("No API key found. Please login first.")

        return yield* Effect.fail(new Error("No API key found. Please login first."))
      }

      const componentPath = yield* pipe(
        Effect.succeed(
          `${BLOCKS_REGISTRY_URL}/api/shadcn-registry/block/${blockCategory}/${blockType}/${blockName}?apiKey=${apikey}`,
        ),
      )

      console.log(componentPath)

      const args = ["add"]

      if (overwrite) {
        args.push("--overwrite")
      }
      args.push(componentPath)

      return yield* pipe(
        RawCommand.make("node", resolveShadcnClone(), ...args).pipe(
          RawCommand.stdin("inherit"),
          RawCommand.stdout("inherit"),
          RawCommand.stderr("inherit"),
          RawCommand.exitCode,
        ),
      )
    }),
).pipe(Command.withDescription("Adds UI components or blocks to your project."))

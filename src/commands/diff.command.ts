import { Command } from "@effect/cli";
import { Console, Effect } from "effect";
import { componentNames, componentType } from "./add.command";

export const diffCommand = Command.make(
	"diff",
	{ componentNames, componentType },
	(config) =>
		Effect.gen(function* () {
			yield* Console.log("Coming soon...");
		}),
).pipe(Command.withDescription("Compares your local components with the registry versions."));

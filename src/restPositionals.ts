import * as Result from "./Result";
import type {
	ArgParser,
	ParseContext,
	ParsingError,
	ParsingResult,
} from "./argparser";
import { type CompletionHandler, setCompletionMetadata } from "./completion";
import type { OutputOf } from "./from";
import type { Descriptive, Displayed, ProvidesHelp } from "./helpdoc";
import type { PositionalArgument } from "./newparser/parser";
import type { HasType, Type } from "./type";
import { string } from "./types";

type RestPositionalsConfig<Decoder extends Type<string, any>> =
	HasType<Decoder> &
		Partial<Displayed & Descriptive> & {
			completion?: CompletionHandler;
		};

/**
 * Read all the positionals and decode them using the type provided.
 * Works best when it is the last item on the `command` construct, to be
 * used like the `...rest` operator in JS and TypeScript.
 */
function fullRestPositionals<Decoder extends Type<string, any>>(
	config: RestPositionalsConfig<Decoder>,
): ArgParser<OutputOf<Decoder>[]> & ProvidesHelp {
	const displayName = config.displayName ?? config.type.displayName ?? "arg";
	const parser: ReturnType<typeof fullRestPositionals> = {
		helpTopics() {
			return [
				{
					usage: `[...${displayName}]`,
					category: "arguments",
					defaults: [],
					description: config.description ?? config.type.description ?? "",
				},
			];
		},
		register(_opts) {},
		async parse({
			nodes,
			visitedNodes,
		}: ParseContext): Promise<ParsingResult<OutputOf<Decoder>[]>> {
			const positionals = nodes.filter(
				(node): node is PositionalArgument =>
					node.type === "positionalArgument" && !visitedNodes.has(node),
			);

			const results: OutputOf<Decoder>[] = [];
			const errors: ParsingError[] = [];

			for (const positional of positionals) {
				visitedNodes.add(positional);
				const decoded = await Result.safeAsync(
					config.type.from(positional.raw),
				);
				if (Result.isOk(decoded)) {
					results.push(decoded.value);
				} else {
					errors.push({
						nodes: [positional],
						message: decoded.error.message,
					});
				}
			}

			if (errors.length > 0) {
				return Result.err({
					errors,
				});
			}

			return Result.ok(results);
		},
	};
	return setCompletionMetadata(parser, {
		kind: "rest",
		name: displayName,
		description: config.description ?? config.type.description,
		completion: config.completion,
	});
}

type StringType = Type<string, string>;

type RestPositionalsParser<Decoder extends Type<string, any>> = ArgParser<
	OutputOf<Decoder>[]
> &
	ProvidesHelp;

/**
 * Read all the positionals and decode them using the type provided.
 * Works best when it is the last item on the `command` construct, to be
 * used like the `...rest` operator in JS and TypeScript.
 *
 * @param config rest positionals argument config
 */
export function restPositionals<Decoder extends Type<string, any>>(
	config: HasType<Decoder> &
		Partial<Displayed & Descriptive> & { completion?: CompletionHandler },
): RestPositionalsParser<Decoder>;
export function restPositionals(
	config?: Partial<HasType<never> & Displayed & Descriptive> & {
		completion?: CompletionHandler;
	},
): RestPositionalsParser<StringType>;
export function restPositionals(
	config?: Partial<HasType<any>> &
		Partial<Displayed & Descriptive> & { completion?: CompletionHandler },
): RestPositionalsParser<any> {
	return fullRestPositionals({
		type: string,
		...config,
	});
}

import { stripVTControlCharacters } from "node:util";
import type { ParsingError } from "./argparser";
import type { AstNode } from "./newparser/parser";
import { styleText } from "./styleText";
import { enumerate, padNoAnsi } from "./utils";

type HighlightResult = { colorized: string; errorIndex: number };

/**
 * Get the input as highlighted keywords to show to the user
 * with the error that was generated from parsing the input.
 *
 * @param nodes AST nodes
 * @param error A parsing error
 */
function highlight(
	nodes: AstNode[],
	error: ParsingError,
): HighlightResult | undefined {
	const strings: string[] = [];
	let errorIndex: undefined | number = undefined;

	function foundError() {
		if (errorIndex !== undefined) return;
		errorIndex = stripVTControlCharacters(strings.join(" ")).length;
	}

	if (error.nodes.length === 0) return;

	nodes.forEach((node) => {
		if (error.nodes.includes(node)) {
			foundError();
			return strings.push(styleText("red", node.raw));
		}
		if (node.type === "shortOptions") {
			let failed = false;
			let s = "";
			for (const option of node.options) {
				if (error.nodes.includes(option)) {
					s += styleText("red", option.raw);
					failed = true;
				} else {
					s += styleText("dim", option.raw);
				}
			}
			const prefix = failed ? styleText("red", "-") : styleText("dim", "-");
			if (failed) {
				foundError();
			}
			return strings.push(prefix + s);
		}

		return strings.push(styleText("dim", node.raw));
	});

	return { colorized: strings.join(" "), errorIndex: errorIndex ?? 0 };
}

/**
 * An error UI
 *
 * @param breadcrumbs The command breadcrumbs to print with the error
 */
export function errorBox(
	nodes: AstNode[],
	errors: ParsingError[],
	breadcrumbs: string[],
): string {
	const withHighlight: { message: string; highlighted?: HighlightResult }[] =
		[];

	const errorMessages: string[] = [];

	for (const error of errors) {
		const highlighted = highlight(nodes, error);
		withHighlight.push({ message: error.message, highlighted });
	}

	let number = 1;
	const maxNumberWidth = String(withHighlight.length).length;

	errorMessages.push(
		`${styleText(["red", "bold"], "error: ")}found ${styleText("yellow", String(withHighlight.length))} error${withHighlight.length > 1 ? "s" : ""}`,
	);
	errorMessages.push("");

	withHighlight
		.filter((x) => x.highlighted)
		.forEach((x) => {
			if (!x.highlighted) {
				throw new Error("WELP");
			}

			const pad = "".padStart(x.highlighted.errorIndex);

			errorMessages.push(`  ${x.highlighted.colorized}`);
			for (const [index, line] of enumerate(x.message.split("\n"))) {
				const prefix = index === 0 ? styleText("bold", "^") : " ";
				const msg = styleText("red", `  ${pad} ${prefix} ${line}`);
				errorMessages.push(msg);
			}
			errorMessages.push("");
			number++;
		});

	const withNoHighlight = withHighlight.filter((x) => !x.highlighted);

	if (number > 1) {
		if (withNoHighlight.length === 1) {
			errorMessages.push("Along with the following error:");
		} else if (withNoHighlight.length > 1) {
			errorMessages.push("Along with the following errors:");
		}
	}

	withNoHighlight.forEach(({ message }) => {
		const num = styleText(
			["red", "bold"],
			`${padNoAnsi(number.toString(), maxNumberWidth, "start")}.`,
		);
		const lines = message.split("\n");
		errorMessages.push(`  ${num} ${styleText("red", lines[0] ?? "")}`);
		for (const line of lines.slice(1)) {
			errorMessages.push(
				` ${"".padStart(maxNumberWidth + 1)}  ${styleText("red", line)}`,
			);
		}
		number++;
	});

	const helpCmd = styleText("yellow", `${breadcrumbs.join(" ")} --help`);

	errorMessages.push("");
	errorMessages.push(
		`${styleText(["red", "bold"], "hint: ")}for more information, try '${helpCmd}'`,
	);

	return errorMessages.join("\n");
}

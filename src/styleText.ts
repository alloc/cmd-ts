import { styleText as nodeStyleText } from "node:util";

type Style = Exclude<Parameters<typeof nodeStyleText>[0], unknown[]>;

// styleText did not handle terminal color settings until Node 20.18.
function colorsEnabled(): boolean {
	if (process.env.FORCE_COLOR !== undefined) {
		return !["0", "false"].includes(process.env.FORCE_COLOR.toLowerCase());
	}
	if (
		process.env.NO_COLOR !== undefined ||
		process.env.NODE_DISABLE_COLORS !== undefined
	) {
		return false;
	}
	return Boolean(process.stdout.isTTY);
}

export function styleText(format: Style | Style[], text: string): string {
	if (!colorsEnabled()) return text;

	// Node 20.12 only accepts one format at a time, so compose them manually.
	const formats = Array.isArray(format) ? format : [format];
	return formats.reduceRight(
		(value, current) =>
			nodeStyleText(current === "grey" ? "gray" : current, value, {
				validateStream: false,
			}),
		text,
	);
}

import { stripVTControlCharacters } from "node:util";
import { describe, expect, it } from "vitest";
import { expectTypeOf } from "vitest";
import { styleText } from "../src/styleText";
import { type AllOrNothing, padNoAnsi } from "../src/utils";

describe("padNoAnsi", () => {
	it("pads start", () => {
		const expected = "hello".padStart(10, " ");
		const actual = padNoAnsi(
			[
				styleText("red", "h"),
				styleText("cyan", "e"),
				styleText("blue", "l"),
				styleText("green", "l"),
				styleText("red", "o"),
			].join(""),
			10,
			"start",
		);
		expect(stripVTControlCharacters(actual)).toEqual(expected);
	});
	it("pads end", () => {
		const expected = "hello".padEnd(10, " ");
		const actual = padNoAnsi(
			[
				styleText("red", "h"),
				styleText("cyan", "e"),
				styleText("blue", "l"),
				styleText("green", "l"),
				styleText("red", "o"),
			].join(""),
			10,
			"end",
		);
		expect(stripVTControlCharacters(actual)).toEqual(expected);
	});
	it("returns the string if it is shorter than the padding", () => {
		const str = [
			styleText("red", "h"),
			styleText("cyan", "e"),
			styleText("blue", "l"),
			styleText("green", "l"),
			styleText("red", "o"),
		].join("");
		const actual = padNoAnsi(str, 2, "end");
		expect(actual).toEqual(str);
	});
});

it("allows to provide all arguments or none", () => {
	type Person = { name: string; age: number };
	expectTypeOf<{ name: "Joe"; age: 100 }>().toExtend<AllOrNothing<Person>>();
	expectTypeOf<{ name: "Joe" }>().not.toExtend<AllOrNothing<Person>>();
	expectTypeOf<{}>().toExtend<AllOrNothing<Person>>();
});

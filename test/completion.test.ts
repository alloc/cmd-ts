import { afterEach, describe, expect, test, vi } from "vitest";
import {
	binary,
	command,
	flag,
	option,
	positional,
	restPositionals,
	runSafely,
	subcommands,
} from "../src";

afterEach(() => vi.restoreAllMocks());

function captureOutput() {
	const lines: string[] = [];
	vi.spyOn(console, "log").mockImplementation((line = "") => {
		lines.push(String(line));
	});
	return lines;
}

describe("Tab completion", () => {
	test("does not affect normal parsing and execution", async () => {
		const handler = vi.fn();
		const app = command({
			name: "tool",
			args: { value: positional() },
			handler,
		});

		await runSafely(app, ["hello"]);
		expect(handler).toHaveBeenCalledWith({ value: "hello" });
	});

	test.each(["zsh", "bash", "fish", "powershell"])(
		"generates a %s completion script",
		async (shell) => {
			const lines = captureOutput();
			const app = command({ name: "tool", args: {}, handler() {} });

			await runSafely(app, ["complete", shell]);

			expect(lines.join("\n")).toContain("tool complete");
			expect(lines.join("\n")).toContain("--");
		},
	);

	test("completes nested commands, aliases, flags, options, and values", async () => {
		const lines = captureOutput();
		const serve = command({
			name: "serve",
			aliases: ["s"],
			description: "Start the server",
			args: {
				force: flag({ long: "force", short: "f", description: "Force it" }),
				mode: option({
					long: "mode",
					short: "m",
					completion(complete) {
						complete("dev", "Development");
						complete("prod", "Production");
					},
				}),
			},
			handler() {},
		});
		const app = subcommands({
			name: "tool",
			cmds: {
				admin: subcommands({ name: "admin", cmds: { serve } }),
			},
		});

		await runSafely(app, ["complete", "--", "admin", "s", "--mode", ""]);

		expect(lines).toContain("dev\tDevelopment");
		expect(lines).toContain("prod\tProduction");
		lines.length = 0;
		await runSafely(app, ["complete", "--", "admin", "serve", "--"]);
		expect(lines).toContain("--force\tForce it");
		expect(lines.some((line) => line.startsWith("--mode\t"))).toBe(true);
	});

	test("completes positional and rest positional values", async () => {
		const lines = captureOutput();
		const app = command({
			name: "tool",
			args: {
				input: positional({
					completion: (complete) => complete("input.txt", "Input file"),
				}),
				extra: restPositionals({
					completion: (complete) => complete("extra.txt", "Extra file"),
				}),
			},
			handler() {},
		});

		await runSafely(app, ["complete", "--", ""]);
		expect(lines).toContain("input.txt\tInput file");
		lines.length = 0;
		await runSafely(app, ["complete", "--", "input.txt", ""]);
		expect(lines).toContain("extra.txt\tExtra file");
	});

	test("uses supplied binary runner arguments instead of process.argv", async () => {
		const lines = captureOutput();
		const app = binary(command({ name: "tool", args: {}, handler() {} }));

		await runSafely(app, ["node", "/tmp/tool.js", "complete", "--", ""]);

		expect(lines.at(-1)).toMatch(/^:/);
	});

	test("a user-defined complete command takes precedence", async () => {
		const handler = vi.fn();
		const app = subcommands({
			name: "tool",
			cmds: {
				complete: command({ name: "complete", args: {}, handler }),
			},
		});

		await runSafely(app, ["complete"]);
		expect(handler).toHaveBeenCalledOnce();
	});
});

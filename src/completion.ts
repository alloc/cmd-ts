const completionMetadata = Symbol("cmd-ts completion metadata");
const binaryPrograms = new WeakSet<object>();

type TabCommand = {
	option(
		value: string,
		description: string,
		handlerOrAlias?: ((complete: Complete) => void) | string,
		alias?: string,
	): TabCommand;
	argument(
		name: string,
		handler?: (complete: Complete) => void,
		variadic?: boolean,
	): TabCommand;
};

type TabRootCommand = TabCommand & {
	command(value: string, description: string): TabCommand;
	parse(args: string[]): void;
	setup(name: string, executable: string, shell: string): void;
};

type TabModule = { RootCommand: new () => TabRootCommand };

export type Complete = (value: string, description?: string) => void;
export type CompletionHandler = (complete: Complete) => void;

export type CompletionArgument =
	| {
			kind: "flag";
			long: string;
			short?: string;
			description?: string;
	  }
	| {
			kind: "option";
			long: string;
			short?: string;
			description?: string;
			completion?: CompletionHandler;
	  }
	| {
			kind: "positional" | "rest";
			name: string;
			description?: string;
			completion?: CompletionHandler;
	  };

export type CompletionCommand = {
	kind: "command";
	name: string;
	description?: string;
	aliases?: string[];
	arguments: CompletionArgument[];
};

export type CompletionSubcommands = {
	kind: "subcommands";
	name: string;
	description?: string;
	commands: Record<string, CompletionProgram>;
};

export type CompletionProgram = CompletionCommand | CompletionSubcommands;

type WithCompletionMetadata = {
	[completionMetadata]?: CompletionArgument | CompletionProgram;
};

export function setCompletionMetadata<T extends object>(
	value: T,
	metadata: CompletionArgument | CompletionProgram,
): T {
	Object.defineProperty(value, completionMetadata, { value: metadata });
	return value;
}

export function getCompletionMetadata(
	value: object,
): CompletionArgument | CompletionProgram | undefined {
	return (value as WithCompletionMetadata)[completionMetadata];
}

export function setBinaryCompletion<T extends object>(value: T): T {
	binaryPrograms.add(value);
	return value;
}

export function hasCompletionCommandCollision(program: object): boolean {
	const metadata = getCompletionMetadata(program);
	if (!metadata || !("kind" in metadata) || metadata.kind !== "subcommands") {
		return false;
	}
	const command = metadata.commands.complete;
	return (
		command !== undefined ||
		Object.values(metadata.commands).some((candidate) =>
			candidate.kind === "command"
				? candidate.aliases?.includes("complete")
				: false,
		)
	);
}

export async function runCompletion(
	program: object,
	rawArgs: string[],
): Promise<boolean> {
	const args = binaryPrograms.has(program) ? rawArgs.slice(2) : rawArgs;
	if (args[0] !== "complete" || hasCompletionCommandCollision(program)) {
		return false;
	}

	const metadata = getCompletionMetadata(program);
	if (!isCompletionProgram(metadata)) return false;

	const { RootCommand } = await loadTab();
	const tab = createTabProgram(metadata, RootCommand);
	if (args[1] === "--") {
		const completionArgs = args.slice(2);
		tab.parse(
			metadata.kind === "command"
				? ["__cmd_ts_root", ...completionArgs]
				: completionArgs,
		);
		return true;
	}

	if (
		args.length === 2 &&
		["zsh", "bash", "fish", "powershell"].includes(args[1])
	) {
		tab.setup(metadata.name, metadata.name, args[1]);
		return true;
	}

	return false;
}

function createTabProgram(
	program: CompletionProgram,
	RootCommand: new () => TabRootCommand,
): TabRootCommand {
	const root = new RootCommand();
	if (program.kind === "command") {
		addArguments(
			root.command("__cmd_ts_root", program.description ?? ""),
			program.arguments,
		);
	} else {
		addSubcommands(root, program.commands, []);
	}
	return root;
}

function addSubcommands(
	root: TabRootCommand,
	commands: Record<string, CompletionProgram>,
	parents: string[],
): void {
	for (const [name, program] of Object.entries(commands)) {
		const names =
			program.kind === "command" ? [name, ...(program.aliases ?? [])] : [name];
		for (const commandName of names) {
			const path = [...parents, commandName];
			if (program.kind === "command") {
				const command = root.command(path.join(" "), program.description ?? "");
				addArguments(command, program.arguments);
			} else {
				root.command(path.join(" "), program.description ?? "");
				addSubcommands(root, program.commands, path);
			}
		}
	}
}

function isCompletionProgram(
	metadata: CompletionArgument | CompletionProgram | undefined,
): metadata is CompletionProgram {
	return metadata?.kind === "command" || metadata?.kind === "subcommands";
}

async function loadTab(): Promise<TabModule> {
	return import("@bomb.sh/tab") as Promise<TabModule>;
}

function addArguments(command: TabCommand, args: CompletionArgument[]): void {
	for (const argument of args) {
		if (argument.kind === "flag") {
			command.option(argument.long, argument.description ?? "", argument.short);
		} else {
			const handler = argument.completion
				? (complete: Complete) =>
						argument.completion?.((value, description) =>
							complete(value, description ?? ""),
						)
				: undefined;
			if (argument.kind === "option") {
				command.option(
					argument.long,
					argument.description ?? "",
					handler,
					argument.short,
				);
			} else {
				command.argument(argument.name, handler, argument.kind === "rest");
			}
		}
	}
}

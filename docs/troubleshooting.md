# Troubleshooting

> Start from a visible command failure, verify the parser boundary involved,
> and apply the smallest correction.

## The package import cannot be resolved

**Symptom:** TypeScript or Node cannot resolve `cmd-ts`.

Verify the installed package name:

```bash
pnpm list @alloc/cmd-ts
```

Import the current package scope:

```ts
import { command } from '@alloc/cmd-ts';
```

Battery imports also keep the scope, for example
`@alloc/cmd-ts/batteries/fs`.

## Required input is reported even though a default exists

Check where the fallback is defined and which parser supports it. Scalar
options and flags can use `env`, `defaultValue`, or `onMissing`; positionals can
use a type that provides `defaultValue`; repeatable options support
`defaultValue` and `onMissing`.

If several sources exist, verify the precedence in
[Required and optional input](./concepts/required-and-optional-input.md).

## An option is reported as unknown

Confirm that its parser is included in the selected command's `args` and that
the invocation uses the configured `long` or `short` name:

```ts
const environment = option({ long: 'environment', short: 'e' });
```

Valid forms include `--environment production` and `-e production`.

If the value starts with `-`, use an equals form or `--` where appropriate so
the tokenizer does not treat it as another named argument.

## A positional parser receives the wrong value

Positional parsers consume unclaimed values in `command.args` property order.
Move `restPositionals` and `rest` after scalar positional parsers:

```ts
args: {
  program: positional(),
  forwarded: rest(),
}
```

Then use `parse(command, arguments)` to inspect decoded values without running
the handler.

## Help or version exits a test process

`run` applies terminal and exit effects. Use `dryRun` to receive rendered text,
or `runSafely` to inspect the effect without applying it:

```ts
const result = await dryRun(app, ['--help']);
```

Do not wrap the command in `binary` unless the test passes a full
`process.argv`-shaped array.

## A decoder error has too little context

Throw an `Error` with a message that states the expected value and relevant
constraint:

```ts
if (!Number.isInteger(value)) {
  throw new Error('Expected an integer');
}
```

Keep validation inside a `Type` so cmd-ts can attach the message to the input
node. An exception thrown later in the handler is application behavior, not a
parsing error.

## Shell completion does not activate

Regenerate and source the script for the current shell:

```bash
source <(acme complete zsh)
```

Check that no top-level command or alias is named `complete`; such a command
disables the built-in protocol to avoid ambiguous dispatch.

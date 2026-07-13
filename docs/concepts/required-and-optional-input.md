# Required and optional input

> Decide whether absence is an error, a static default, an environment value,
> or a dynamic fallback, and make that decision visible in help.

An `option` or `positional` is required unless its parser or type can produce a
value when input is absent. For positionals, put that default on the type. A
plain `flag` is optional because its built-in boolean type defaults to `false`.
Repeatable positional parsers return an empty array when nothing matches.

## Choose the absence behavior

| Mechanism | Use when | Runs during help | Can be async |
| --- | --- | --- | --- |
| `optional(type)` | Absence should produce `undefined` | Its default may be inspected | No |
| `defaultValue` | A synchronous fallback is immediately available | Yes, to describe the default | No |
| `env` | An option may read a named environment variable | The variable name and current value may appear | No |
| `onMissing` | Resolving absence requires parsing-time work | No | Yes |

`defaultValue` should be fast and side-effect free because help generation may
call it. Use `onMissing` for prompts, files, network requests, or other work
that belongs only to actual parsing.

## Follow option fallback precedence

For a scalar `option`, cmd-ts checks sources in this order:

1. A value supplied on the command line.
2. The environment variable named by `env`.
3. `defaultValue` on the parser, then on its type.
4. `onMissing` on the parser, then on its type.
5. A missing-value error.

```ts
const region = option({
  long: 'region',
  env: 'DEPLOY_REGION',
  defaultValue: () => 'us-east-1',
  defaultValueIsSerializable: true,
});
```

`--region eu-west-1` wins over `DEPLOY_REGION`; the environment wins over the
static default.

> [!NOTE]
> `env` is supported by scalar `option` and `flag`, not by positional parsers
> or `multioption`. Flag environment values must be `true` or `false`.

## Put reusable defaults on a type deliberately

A type-level fallback affects every compatible parser that uses the type.
Parser-level fallbacks override it where the parser supports them. For a
command-specific optional positional, derive a type for that argument:

```ts
const output = positional({
  type: optional(string),
  displayName: 'output',
});
```

This produces `string | undefined`. To use a concrete default such as `dist`,
define a small type for the argument:

```ts
const OutputDirectory = {
  ...string,
  defaultValue: () => 'dist',
};

const output = positional({ type: OutputDirectory, displayName: 'output' });
```

Use `optional(string)` when the handler must distinguish absence from a real
string:

```ts
const label = option({ long: 'label', type: optional(string) });
// Handler type: string | undefined
```

## Describe defaults honestly

Set `defaultValueIsSerializable: true` only when converting the value to text
produces useful, non-sensitive help output. Otherwise help marks the argument
optional without exposing the value.

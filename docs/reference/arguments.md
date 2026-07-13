# Argument reference

> Look up the accepted forms, required configuration, defaults, and output
> behavior of command composition and argument parsers.

Exact inferred signatures come from the package's TypeScript declarations. This
page describes the choices that affect command behavior.

## Composition

### `command(config)`

Combines argument parsers and calls a handler after every parser succeeds.

| Field | Type | Required | Purpose |
| --- | --- | --- | --- |
| `name` | `string` | Yes | Name used in help and errors. |
| `args` | parser object | Yes | Parser outputs become same-named handler fields. |
| `handler` | function | Yes | Runs with decoded arguments. |
| `description` | `string` | No | Summary shown in help. |
| `version` | `string` | No | Enables `--version` and `-v`. |
| `aliases` | `string[]` | No | Alternate names when used as a subcommand. |
| `examples` | example array | No | Commands shown in help. |

```ts
const app = command({
  name: 'echo',
  args: { value: positional() },
  handler: ({ value }) => value,
});
```

### `subcommands(config)`

Selects a command by the next positional value. `name` and `cmds` are required;
`description`, `version`, and `examples` are optional. The keys of `cmds` are
dispatch names. Child command aliases are also accepted.

### `binary(command)`

Adapts a named command to Node's full `process.argv` array. Use it at a process
entrypoint, not with argument-only arrays.

## Scalar parsers

| Parser | Claims | Default decoder | Missing behavior |
| --- | --- | --- | --- |
| `positional` | Next unclaimed positional | `string` | Error unless a default exists. |
| `option` | One named value | `string` | Error unless env/default/fallback exists. |
| `flag` | One named boolean occurrence | boolean | `false` with the default type. |

### `positional(config?)`

Fields: `type`, `displayName`, `description`, and `completion`. With no config,
it decodes one required string and uses `arg` as its display name. To make it
optional, supply a type with a default, such as `optional(string)`.

### `option(config)`

`long` is required. Optional fields are `short`, `type`, `description`, `env`,
`completion`, `defaultValue`, `defaultValueIsSerializable`, and `onMissing`.
Without `type`, the value remains a string.

Accepted forms:

```text
--output dist
--output=dist
-o dist
-o=dist
```

Providing the same scalar option more than once is an error.

### `flag(config)`

`long` is required. Optional fields are `short`, `type`, `description`, `env`,
`defaultValue`, `defaultValueIsSerializable`, and `onMissing`. Without `type`,
an absent flag is `false` and a present flag is `true`.

Accepted forms include `--verbose`, `-v`, `--verbose=true`, and
`--verbose=false`. Registered short flags may be stacked, as in `-abc`.
Providing the same scalar flag more than once is an error.

## Repeatable and catch-all parsers

| Parser | Decoder input | Empty input | Use for |
| --- | --- | --- | --- |
| `multioption` | `string[]` | Passed to its type unless a fallback exists | Repeated named values. |
| `multiflag` | `boolean[]` | Passed to its type | Repeated boolean occurrences. |
| `restPositionals` | Each item is decoded separately | Returns `[]` | Remaining positional values. |
| `rest` | No decoder; returns `string[]` | Returns `[]` | Literal unclaimed remainder. |

### `multioption(config)`

Requires `long` and `type`. Optional fields are `short`, `description`,
`completion`, `defaultValue`, `defaultValueIsSerializable`, and `onMissing`.
The type must accept the complete `string[]`, such as `array(string)`.

### `multiflag(config)`

Requires `long` and a type that accepts `boolean[]`. `short` and `description`
are optional. The decoder receives one boolean for each occurrence.

### `restPositionals(config?)`

Accepts `type`, `displayName`, `description`, and `completion`. It decodes each
remaining positional separately and returns the decoded array.

### `rest(config?)`

Accepts `displayName`, `description`, and `completion`. It returns unclaimed
input after the last claimed node, including option-like tokens, without value
decoding.

> [!IMPORTANT]
> Put catch-all parsers last in `command.args` so they do not claim input needed
> by later parsers.

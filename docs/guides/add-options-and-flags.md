# Add options and flags

> Choose scalar or repeatable named arguments, then make their required and
> fallback behavior visible to users.

Use an option when the name needs a value and a flag when the name represents a
boolean switch.

```text
deploy --environment production --verbose
       └──────── option ────────┘ └─ flag ─┘
```

## Add a required option

`option` accepts `--long value`, `--long=value`, `-s value`, and `-s=value`:

```ts
import { command, oneOf, option } from '@alloc/cmd-ts';

const deploy = command({
  name: 'deploy',
  args: {
    environment: option({
      long: 'environment',
      short: 'e',
      type: oneOf(['staging', 'production'] as const),
      description: 'Deployment environment',
    }),
  },
  handler({ environment }) {
    console.log(`Deploying to ${environment}`);
  },
});
```

Omitting `--environment` is an error because neither the parser nor its type
defines a fallback.

## Add an optional flag

`flag` uses the built-in boolean decoder by default. An absent flag produces
`false`, while `--verbose` produces `true`:

```ts
import { flag } from '@alloc/cmd-ts';

const verbose = flag({
  long: 'verbose',
  short: 'v',
  description: 'Print deployment details',
});
```

Short flags can be stacked. If `-v`, `-f`, and `-q` are registered flags,
`-vfq` is equivalent to `-v -f -q`.

## Read repeated values

Use `multioption` with an array decoder when a named option can occur more than
once:

```ts
import { array, multioption, string } from '@alloc/cmd-ts';

const tag = multioption({
  long: 'tag',
  short: 't',
  type: array(string),
  description: 'Tag added to the deployment',
});
```

Given `--tag stable -t public`, the decoded value is
`['stable', 'public']`. With no occurrences, `array(string)` decodes an empty
array.

`multiflag` is the corresponding low-level parser for repeated boolean
occurrences. It requires a decoder from `boolean[]` to the value your handler
needs; use it when the number or sequence of occurrences matters.

## Define a fallback

Use `defaultValue` for a synchronous value known without parsing-time work:

```ts
const environment = option({
  long: 'environment',
  type: oneOf(['staging', 'production'] as const),
  defaultValue: () => 'staging' as const,
  defaultValueIsSerializable: true,
});
```

The generated help displays `staging` because the value is marked
serializable. Without that marker, help describes the option as optional but
does not print the value.

Use `onMissing` for asynchronous or parsing-time work, such as reading a config
file or prompting a user:

```ts
const token = option({
  long: 'token',
  onMissing: async () => loadToken(),
});
```

See [Required and optional input](../concepts/required-and-optional-input.md)
for fallback precedence and environment variables.

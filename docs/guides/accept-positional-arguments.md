# Accept positional arguments

> Choose between one positional value, all remaining positional values, and a
> literal remainder that preserves option-like tokens.

Positional arguments are values not claimed by an option or flag:

```text
deploy api --environment production manifest.json
       └┘                          └───────────┘
             positional arguments
```

## Decode one positional

Use `positional` once for each named value your handler needs:

```ts
import { command, positional } from '@alloc/cmd-ts';

const copy = command({
  name: 'copy',
  args: {
    source: positional({ displayName: 'source' }),
    destination: positional({ displayName: 'destination' }),
  },
  handler({ source, destination }) {
    console.log(`${source} -> ${destination}`);
  },
});
```

Given `copy input.txt archive/input.txt`, parsers consume positionals in the
order they appear in `args`.

## Decode all remaining positionals

Use `restPositionals` for zero or more positional values and put it after every
single positional parser:

```ts
import { command, restPositionals } from '@alloc/cmd-ts';

const remove = command({
  name: 'remove',
  args: {
    files: restPositionals({
      displayName: 'file',
      description: 'File to remove',
    }),
  },
  handler({ files }) {
    console.log(files);
  },
});
```

Given `remove a.txt b.txt`, `files` is `['a.txt', 'b.txt']`. Add a `type` to
decode each item before it reaches the handler.

## Preserve the literal remainder

Use `rest` when forwarding arguments to another program. Unlike
`restPositionals`, it also captures unclaimed flags and options after the last
claimed argument:

```ts
import { command, positional, rest } from '@alloc/cmd-ts';

const exec = command({
  name: 'exec',
  args: {
    program: positional({ displayName: 'program' }),
    forwarded: rest({ displayName: 'argument' }),
  },
  handler({ program, forwarded }) {
    console.log(program, forwarded);
  },
});
```

Given `exec prettier --write src`, `forwarded` preserves
`['--write', 'src']`.

> [!IMPORTANT]
> Object property order determines parser order. Keep `restPositionals` or
> `rest` last because it claims every matching value left after earlier
> parsers.

Use `--` when the shell input should force later option-looking tokens to be
treated as positional values.

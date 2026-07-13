# Getting started

> Install cmd-ts, run one typed command, and verify its help and validation
> behavior.

## Install the package

Use the package manager already used by your Node.js project:

```bash
pnpm add @alloc/cmd-ts
```

The package includes TypeScript declarations and supports CommonJS and ESM
consumers.

## Create a command

Create `deploy.ts`:

```ts
import { binary, command, flag, number, option, positional, run } from '@alloc/cmd-ts';

const deploy = command({
  name: 'deploy',
  description: 'Deploy a service',
  args: {
    service: positional({ displayName: 'service' }),
    replicas: option({
      long: 'replicas',
      short: 'r',
      type: number,
      description: 'Number of replicas',
    }),
    verbose: flag({
      long: 'verbose',
      short: 'v',
      description: 'Print deployment details',
    }),
  },
  handler({ service, replicas, verbose }) {
    if (verbose) console.log(`Preparing ${service}`);
    console.log(`Deploying ${service} with ${replicas} replicas`);
  },
});

await run(binary(deploy), process.argv);
```

`service` is inferred as `string`, `replicas` as `number`, and `verbose` as
`boolean`. No separate handler interface is necessary.

Run the file with the TypeScript runner used by your project:

```bash
pnpm tsx deploy.ts api --replicas 3 --verbose
```

The command prints:

```text
Preparing api
Deploying api with 3 replicas
```

## Check generated help

Every command recognizes `--help` and `-h`:

```bash
pnpm tsx deploy.ts --help
```

The help groups the positional argument, option, and flag using their display
names and descriptions.

## Check validation

Pass a value that `number` cannot decode:

```bash
pnpm tsx deploy.ts api --replicas many
```

cmd-ts writes a contextual `Not a number` error to standard error and exits
with status 1. The handler does not run.

Next, add defaults and repeatable input in
[Options and flags](./guides/add-options-and-flags.md), or see every parser in
the [argument reference](./reference/arguments.md).

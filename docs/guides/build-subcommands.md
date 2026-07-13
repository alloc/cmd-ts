# Build subcommands

> Combine commands into a typed multi-command program with generated help,
> aliases, and nested dispatch.

Create each operation as a regular `command`, then expose them through
`subcommands`:

```ts
import { binary, command, positional, run, subcommands } from '@alloc/cmd-ts';

const deploy = command({
  name: 'deploy',
  aliases: ['ship'],
  description: 'Deploy a service',
  args: {
    service: positional({ displayName: 'service' }),
  },
  handler({ service }) {
    console.log(`Deploying ${service}`);
  },
});

const status = command({
  name: 'status',
  description: 'Show deployment status',
  args: {},
  handler() {
    console.log('All systems operational');
  },
});

const cli = subcommands({
  name: 'acme',
  version: '1.0.0',
  description: 'Manage Acme services',
  cmds: { deploy, status },
});

await run(binary(cli), process.argv);
```

The keys in `cmds` are the names used for dispatch. These invocations select
the same command:

```bash
acme deploy api
acme ship api
```

An alias belongs to the child `command`, not the `cmds` object.

## Generate contextual help

With no arguments, a subcommand program shows its available commands. Help for
a selected command uses its full path:

```bash
acme --help
acme deploy --help
```

If the user misspells a command, cmd-ts suggests a close command or alias when
one exists.

## Nest command groups

A `subcommands` result can be placed inside another `cmds` object:

```ts
const config = subcommands({
  name: 'config',
  cmds: { get, set },
});

const cli = subcommands({
  name: 'acme',
  cmds: { deploy, config },
});
```

This creates paths such as `acme config get`. Keep nesting aligned with tasks
users recognize; avoid mirroring internal modules merely because they exist.

## Add examples to help

Both `command` and `subcommands` accept examples:

```ts
examples: [
  { description: 'Deploy the API', command: 'acme deploy api' },
]
```

The default formatter prints these examples after the argument or command
listing.

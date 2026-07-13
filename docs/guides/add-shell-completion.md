# Add shell completion

> Expose command structure and domain-specific values through the built-in
> `complete` protocol.

Every command and subcommand program supports the
[`@bomb.sh/tab`](https://github.com/bombshell-dev/tab) completion protocol.
Commands, aliases, flags, options, positional arguments, rest arguments, and
nested subcommands are discovered from the definitions already used to parse
input.

## Load completion for a shell

Generate and load a script for the current session:

```bash
source <(acme complete zsh)
```

The supported shell names are `bash`, `fish`, `powershell`, and `zsh`. The
generated script calls the live completion endpoint internally:

```bash
acme complete -- <arguments being completed>
```

No completion-specific setup is required in the program itself.

## Complete domain values

Options, positional arguments, `restPositionals`, and `rest` accept a
synchronous `completion` callback:

```ts
import { command, option, positional } from '@alloc/cmd-ts';

const deploy = command({
  name: 'deploy',
  args: {
    environment: option({
      long: 'environment',
      completion(complete) {
        complete('staging', 'Staging environment');
        complete('production', 'Production environment');
      },
    }),
    service: positional({
      displayName: 'service',
      completion(complete) {
        complete('api', 'Public API');
        complete('worker', 'Background worker');
      },
    }),
  },
  handler() {},
});
```

Each call adds a value and an optional description. Completion callbacks are
synchronous because they follow Tab's core completion API.

## Avoid a command-name collision

If a top-level subcommand is named `complete`, or has `complete` as an alias,
that user-defined command takes precedence. Its parser and handler continue to
work, but the built-in completion protocol is disabled for the program.

> [!IMPORTANT]
> Reserve the top-level name `complete` if shell completion is part of the
> program's interface.

# Shell completion

Every command and subcommand program supports the
[`@bomb.sh/tab`](https://github.com/bombshell-dev/tab) completion protocol. No
setup is required in the program itself.

Generate and load a completion script for the current shell:

```sh
source <(my-program complete zsh)
```

`bash`, `fish`, and `powershell` are also supported. The generated script uses
the live completion endpoint internally:

```sh
my-program complete -- <arguments being completed>
```

Commands and their aliases, flags, value-taking options, positional arguments,
rest positionals, and nested subcommands are included automatically.

## Custom value completion

Options, positional arguments, rest positionals, and `rest` accept a
`completion` callback. The callback is typed as `CompletionHandler` and receives
a function for adding a value and optional description:

```ts
import { command, option, positional } from '@alloc/cmd-ts';

const app = command({
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
      completion: (complete) => complete('api', 'API service'),
    }),
  },
  handler(args) {
    // ...
  },
});
```

Completion callbacks are synchronous, matching Tab's core completion API.

## The `complete` command name

If a top-level subcommand is named `complete`, or has `complete` as an alias,
that user-defined command takes precedence. Its parsing and handler behavior are
unchanged, and the built-in completion protocol is disabled for that program to
avoid ambiguous dispatch.

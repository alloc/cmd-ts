# Customize help

> Improve generated help through command metadata, or replace its formatting
> globally when the default layout is not suitable.

Start with metadata on commands and argument parsers. The default formatter
uses it to produce descriptions, usage placeholders, defaults, aliases, and
examples.

```ts
const deploy = command({
  name: 'deploy',
  version: '1.0.0',
  description: 'Deploy a service',
  aliases: ['ship'],
  examples: [
    { description: 'Deploy the API', command: 'acme deploy api' },
  ],
  args: {
    service: positional({
      displayName: 'service',
      description: 'Service to deploy',
    }),
  },
  handler() {},
});
```

Run `acme deploy --help` to verify the public interface whenever this metadata
changes.

## Replace the formatter

Use `setDefaultHelpFormatter` when every command in the process needs a
different layout:

```ts
import {
  setDefaultHelpFormatter,
  type HelpFormatter,
} from '@alloc/cmd-ts';

const formatter: HelpFormatter = {
  formatCommand(data) {
    return [data.name, data.description].filter(Boolean).join('\n');
  },
  formatSubcommands(data) {
    const commands = data.commands.map((command) => command.name).join(', ');
    return `${data.name}: ${commands}`;
  },
};

setDefaultHelpFormatter(formatter);
```

`formatCommand` receives command identity, path, version, description, aliases,
argument help topics, and examples. `formatSubcommands` receives group identity,
path, version, description, child command metadata, and examples.

The formatter is process-global. Call `resetHelpFormatter()` in test cleanup or
when a temporary formatter should no longer apply. `defaultHelpFormatter` is
exported when a wrapper needs to delegate to the built-in implementation.

> [!CAUTION]
> A custom formatter owns all help output. Preserve actionable usage,
> descriptions, and subcommand discovery rather than returning branding alone.

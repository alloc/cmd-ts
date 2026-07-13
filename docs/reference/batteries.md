# Battery reference

> Add Node-specific path and URL decoders, or opt into the bundled alternate
> help formatter, without enlarging the main import surface.

Batteries use package subpath imports and are not re-exported from
`@alloc/cmd-ts`.

## File-system types

Import from `@alloc/cmd-ts/batteries/fs`:

```ts
import { Directory, ExistingPath, File } from '@alloc/cmd-ts/batteries/fs';
```

| Type | Output | Failure or normalization behavior |
| --- | --- | --- |
| `ExistingPath` | Absolute path string | Resolves against the working directory; fails if absent. |
| `Directory` | Absolute directory string | Returns a directory unchanged; given a file, returns its parent directory. |
| `File` | Absolute file path string | Fails unless the resolved path is a file. |

```ts
const config = option({ long: 'config', type: File });
```

Given `--config ./config.json`, the handler receives an absolute path after the
file's existence and kind are checked.

## URL types

Import from `@alloc/cmd-ts/batteries/url`:

```ts
import { HttpUrl, Url } from '@alloc/cmd-ts/batteries/url';
```

Both currently return Node's `URL` and accept only `http:` or `https:` URLs.
`HttpUrl` extends `Url` and repeats the protocol restriction.

```ts
const endpoint = option({ long: 'endpoint', type: HttpUrl });
```

Given `--endpoint https://example.com/api`, the handler receives a `URL`.

## Vercel-style help formatter

Import the formatter from `@alloc/cmd-ts/batteries/vercel-formatter`:

```ts
import { setDefaultHelpFormatter } from '@alloc/cmd-ts';
import { createVercelFormatter } from '@alloc/cmd-ts/batteries/vercel-formatter';

setDefaultHelpFormatter(
  createVercelFormatter({
    cliName: 'Acme CLI',
    logo: '▲',
  }),
);
```

`cliName` is optional. `logo` defaults to `▲`. The same module exports
`vercelFormatter`, a preconfigured formatter using those defaults.

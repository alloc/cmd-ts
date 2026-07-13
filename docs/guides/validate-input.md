# Validate input

> Move string validation and transformation into reusable types so handlers
> receive domain values or do not run.

A `Type<Input, Output>` converts parser input to a handler value. Its `from`
method may return a value or promise and should throw an `Error` when decoding
fails.

## Extend a bundled type

Use `extendType` to preserve the base type's metadata while adding another
decoding step:

```ts
import { command, extendType, number, option } from '@alloc/cmd-ts';

const Port = extendType(number, (value) => {
  if (!Number.isInteger(value) || value < 1 || value > 65_535) {
    throw new Error('Expected an integer from 1 to 65535');
  }
  return value;
});

const serve = command({
  name: 'serve',
  args: {
    port: option({ long: 'port', type: Port }),
  },
  handler({ port }) {
    // port is a number that passed the range check.
    console.log(`Listening on ${port}`);
  },
});
```

Given `--port 70000`, cmd-ts reports the thrown message and does not call the
handler.

## Define a type directly

Implement `Type` directly when the decoder starts from the parser's raw input
or needs its own help metadata:

```ts
import type { Type } from '@alloc/cmd-ts';

const JsonObject: Type<string, Record<string, unknown>> = {
  displayName: 'json',
  description: 'A JSON object',
  async from(input) {
    const value: unknown = JSON.parse(input);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error('Expected a JSON object');
    }
    return value as Record<string, unknown>;
  },
};
```

`displayName` appears in usage placeholders. `description` supplies help text
when the parser itself has no description.

## Restrict strings to known values

Use `oneOf` for a fixed literal set:

```ts
const environment = oneOf(['development', 'production'] as const);
```

The output type is `'development' | 'production'`, and any other string
produces an error listing the allowed values.

Use `union` when several decoders accept the same input but produce different
output types:

```ts
const id = union([number, string]);
```

Decoders run from left to right. The first success wins; if every decoder
fails, their error messages are joined with newlines unless `combineErrors` is
provided.

See the [type reference](../reference/types.md) for bundled decoders and
combinators.

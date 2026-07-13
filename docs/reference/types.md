# Type reference

> Look up bundled decoders and combinators that turn parser input into handler
> values.

## `Type<From, To>`

A type requires `from(input): To | Promise<To>`. It may also define
`displayName`, `description`, `defaultValue`, `defaultValueIsSerializable`, and
`onMissing`.

```ts
const Integer: Type<string, number> = {
  displayName: 'integer',
  async from(input) {
    const value = Number(input);
    if (!Number.isInteger(value)) throw new Error('Expected an integer');
    return value;
  },
};
```

## Bundled types

| Type | Input → output | Behavior |
| --- | --- | --- |
| `string` | `string → string` | Identity decoder. |
| `number` | `string → number` | Uses `Number.parseFloat`; rejects `NaN`. |
| `boolean` | `boolean → boolean` | Identity decoder for flags; defaults to `false`. |

> [!NOTE]
> `number` accepts any prefix that `Number.parseFloat` accepts. Add an
> `extendType` check when the entire string or an integer range must be valid.

## `optional(type)`

Copies a type and adds a synchronous default of `undefined`. The output becomes
`Output | undefined`.

```ts
const label = option({ long: 'label', type: optional(string) });
```

## `array(type)`

Converts `Type<A, B>` to `Type<A[], B[]>` by decoding every item concurrently.
It is commonly paired with `multioption` or `multiflag`.

```ts
const include = multioption({ long: 'include', type: array(string) });
```

## `oneOf(values)`

Accepts exactly one listed string and infers their literal union. Use `as const`
to preserve literal types.

```ts
const mode = oneOf(['safe', 'fast'] as const);
```

## `union(types, options?)`

Tries compatible decoders from left to right and returns the first success. If
all fail, `combineErrors` receives their messages; its default joins them with
newlines. Metadata is merged from left to right.

```ts
const value = union([number, oneOf(['auto'] as const)]);
```

## `extendType(base, next)`

Runs `base.from`, then passes that output to `next`. The next type's metadata
overrides matching base metadata. Defaults and dynamic missing behavior from the
base are removed rather than propagated into the extended type.

```ts
const Integer = extendType(number, (value) => {
  if (!Number.isInteger(value)) throw new Error('Expected an integer');
  return value;
});
```

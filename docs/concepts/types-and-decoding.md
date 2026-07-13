# Types and decoding

> Treat `Type` as the boundary between shell-shaped input and values trusted by
> the command handler.

Shells provide strings, boolean flag occurrences, or repeated collections of
those values. A cmd-ts `Type<From, To>` converts that parser-specific input into
the value a handler receives.

| Parser | Decoder input | Typical decoder output |
| --- | --- | --- |
| `option`, `positional`, `restPositionals` item | `string` | string, number, URL, domain object |
| `flag` | `boolean` | boolean or domain state |
| `multioption` | `string[]` | decoded array or aggregate |
| `multiflag` | `boolean[]` | count, mode, or aggregate |

## Runtime and static types stay aligned

The `from` method defines runtime behavior, while its return type determines
the handler's TypeScript type:

```ts
const PositiveInteger: Type<string, number> = {
  async from(input) {
    const value = Number(input);
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('Expected a positive integer');
    }
    return value;
  },
};
```

When an argument uses `PositiveInteger`, the handler receives `number` only
after that check succeeds.

## Metadata follows types into help

A type may provide:

- `displayName` for the short placeholder in generated usage.
- `description` for fallback help text.
- `defaultValue` and `defaultValueIsSerializable` for static absence behavior.
- `onMissing` for dynamic absence behavior.

Parser-level metadata takes precedence where both exist. This lets a reusable
type describe itself while a particular argument gives more specific wording.

## Compose rather than repeat

`extendType(base, next)` runs the base decoder and passes its output to the next
decoder. Metadata is merged, but base `defaultValue` and `onMissing` behavior is
intentionally not inherited through the extension.

`array(type)` applies one decoder independently to each input. `union(types)`
tries alternative decoders in order. `oneOf(values)` builds a literal string
union.

Use [Validate input](../guides/validate-input.md) for complete examples and the
[type reference](../reference/types.md) for the available helpers.

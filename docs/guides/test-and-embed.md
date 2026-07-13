# Test and embed commands

> Choose an execution API that exposes results and errors without unexpectedly
> terminating a test runner or host process.

Use `dryRun` for most command tests. It runs the handler on success but converts
cmd-ts exit effects into a `Result` whose error is formatted text.

```ts
import { dryRun } from '@alloc/cmd-ts';

const success = await dryRun(deploy, ['api', '--replicas', '3']);
if (success._tag === 'ok') {
  console.log(success.value);
}

const failure = await dryRun(deploy, ['api', '--replicas', 'many']);
if (failure._tag === 'error') {
  console.error(failure.error);
}
```

The `_tag` field narrows the returned result to its `value` or `error` branch.

## Parse without running the handler

Use `parse` to test decoded arguments independently of handler side effects:

```ts
import { parse } from '@alloc/cmd-ts';

const result = await parse(deploy, ['api', '--replicas', '3']);
```

The returned parsing result contains decoded values on success. On failure it
contains structured parsing errors and may include a partial value.

## Preserve structured exit effects

Use `runSafely` when an embedding application needs the destination, exit code,
and rendered output represented by cmd-ts's internal exit effect:

```ts
const result = await runSafely(deploy, ['--help']);
```

This API does not apply the exit effect. By contrast, `run` applies it: output
is written to the selected stream and `process.exit` is called for errors or
circuit breakers such as help and version.

## Adapt `process.argv` only at the executable boundary

Wrap the top-level command with `binary` when passing Node's full argument
array:

```ts
await run(binary(cli), process.argv);
```

For tests and embedded calls, leave the command unwrapped and pass only the
arguments intended for the command:

```ts
await dryRun(cli, ['deploy', 'api']);
```

See the [runner reference](../reference/runners.md) for the side effects and
return values of each API.

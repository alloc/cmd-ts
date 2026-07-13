# Runner reference

> Choose an execution function by whether the handler should run and whether
> cmd-ts should apply terminal output and process exit effects.

| API | Runs handler | Applies cmd-ts exit effects | Success value | cmd-ts failure |
| --- | --- | --- | --- | --- |
| `run` | Yes | Yes | Handler result | Writes output and exits. |
| `runSafely` | Yes | No | Tagged `Result` with handler result | Tagged `Result` with an exit effect. |
| `dryRun` | Yes | No | Tagged `Result` with handler result | Tagged `Result` with rendered text. |
| `parse` | No | No | Parsing result with decoded arguments | Structured parsing result. |

## `run(command, strings)`

Runs parsing and the handler. On cmd-ts help, version, or parsing failure, it
prints to the effect's stream and calls `process.exit` with status 0 or 1.
Unrelated exceptions are rethrown.

```ts
await run(binary(cli), process.argv);
```

## `runSafely(command, strings)`

Runs parsing and the handler without applying cmd-ts exit effects. It returns a
tagged result:

```ts
const result = await runSafely(cli, ['deploy', 'api']);
if (result._tag === 'ok') {
  console.log(result.value);
} else {
  console.error(result.error.config.message);
}
```

The error effect exposes `config.message`, `config.exitCode`, and `config.into`.
Handler exceptions that are not cmd-ts exit effects are rethrown.

## `dryRun(command, strings)`

Runs parsing and the handler, but converts a cmd-ts exit effect to formatted
text. This is convenient for snapshot tests:

```ts
const result = await dryRun(cli, ['deploy']);
if (result._tag === 'error') {
  expect(result.error).toContain('No value provided');
}
```

## `parse(command, strings)`

Decodes arguments without invoking the handler or applying help/version
circuit breakers. Success contains the handler-shaped argument object. Failure
contains an `errors` array and may contain `partialValue`.

```ts
const result = await parse(deploy, ['api', '--replicas', '3']);
if (result._tag === 'ok') {
  console.log(result.value.replicas); // 3
}
```

## Argument-array boundary

Pass `binary(command)` the complete `process.argv`. Pass an unwrapped command
only its user arguments in tests or embedding code.

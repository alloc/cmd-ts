# Errors and exits

> Distinguish decoding failures, unknown input, help/version circuit breakers,
> and handler exceptions so callers choose the correct runner.

cmd-ts collects parser failures before a command handler runs. Its rendered
errors preserve the relevant input nodes and command path, which makes a bad
value easier to locate than a detached exception from inside a handler.

## Parsing failures

Parsing can fail because input is missing, repeated too many times, unknown, or
rejected by a decoder. A command may collect failures from several argument
parsers into one result.

```text
acme deploy api --replicas many --unknown
                         └───┬───┘ └───┬───┘
                      decode error   unknown input
```

`parse` returns these as structured parsing errors. `dryRun` renders them as a
string. `runSafely` represents the rendered message, destination, and exit code
as an exit effect. `run` applies that effect.

## Help and version are successful control flow for users

Commands recognize `--help` and `-h`. A command with `version` also recognizes
`--version` and `-v`. These requests bypass normal required arguments and the
handler, print to standard output, and exit with status 0 when used through
`run`.

> [!IMPORTANT]
> Do not also assign `-v` to a user flag when the containing command defines a
> version. Reserve it for the generated version behavior.

## Handler exceptions are not parsing errors

`runSafely` catches cmd-ts exit effects, but it rethrows unrelated exceptions
from handlers or application code. Handle expected operational failures in the
handler according to the host application's policy.

Use `dryRun` when asserting rendered command-line failures and `parse` when
asserting decoder behavior without running the handler. The
[runner reference](../reference/runners.md) compares all execution APIs.

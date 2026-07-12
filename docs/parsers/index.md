# Parsers and Combinators

`cmd-ts` can help you build a full command line application, with nested commands, options, arguments, and whatever you want. One of the secret sauces baked into `cmd-ts` is the ability to compose parsers.

## Argument Parser

An argument parser is a simple struct with a `parse` function and an optional `register` function.

`cmd-ts` is shipped with a couple of parsers and combinators to help you build your dream command-line app. [`subcommands`](./subcommands.md) are built using nested [`command`](./command.md)s. Every [`command`](./command.md) is built with [`flag`](./flags.md), [`option`](./options.md) and [`positional`](./positionals.md) arguments. Here is a short parser description:

- [`positional` and `restPositionals`](./positionals.md) to read arguments by position
- [`option` and `multioption`](./options.md) to read binary `--key value` arguments
- [`flag` and `multiflag`](./flags.md) to read unary `--key` arguments
- [`command`](./command.md) to compose multiple arguments into a command line app
- [`subcommands`](./subcommands.md) to compose multiple command line apps into one command line app
- [`binary`](./binary.md) to make a command line app a UNIX-executable-ready command

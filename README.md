# Zero Subgraph

Subgraph for the Zero protocol


# Development quickstart

To run locally:

1. Clone this repository
2. Run `npm install`
3. Run `npm run codegen`
4. Start Graph Node docker instance: `docker-compose up -d`
5. Run `npm run build`
6. Run `npm run create-local`
7. Run `npm run deploy-local`

# Gotchas

- In this version of AssemblyScript, ``===`` does not behave as it does in JS/TS. ``===`` compares references, not equality. Use ``==`` for comparing equality, especially for strings: https://github.com/AssemblyScript/assemblyscript/issues/621
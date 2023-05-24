# Zero Subgraph


![Tests](https://github.com/DistributedCollective/zero/actions/workflows/test-contracts.yml/badge.svg)

Zero is a decentralized protocol based on [Liquity](https://github.com/liquity/dev) that allows RBTC holders to obtain maximum liquidity against their collateral without paying interest. After locking up RBTC as collateral in a smart contract and creating an individual position called a "Line of Credit" aka "Trove", the user can get instant liquidity by minting ZUSD, a USD-pegged stablecoin. Each Line of Credit is required to be collateralized at a minimum collateral ratio of 110%. Any owner of ZUSD can redeem their stablecoins for the underlying collateral at any time. The redemption mechanism and algorithmically adjusted fees guarantee a minimum stablecoin value of 1 USD.

An unprecedented liquidation mechanism based on incentivized stability pool deposits and a redistribution cycle from riskier to safer Lines of Credit provides stability at a much lower collateral ratio than current systems. Stability is maintained via economically-driven user interactions and arbitrage rather than by active governance or monetary interventions.

The Zero Subgraph is a fork of the Liquity subgraph.

Please note that this is still an early version of the subgraph. While it has undergone testing, we are aware there may be some bugs. If you wish to report a bug, please contact us on discord through the [tech-support](https://discord.com/channels/729675474665603133/813119624098611260) or [user-feedback](https://discord.com/channels/729675474665603133/750376232771780608) channels to let us know.

For more information on The Graph protocol, head to the Graph documentation here: https://thegraph.com/docs/.


# Development

To run locally:

- clone repo
- Run `npm install`
- Add a `.env.dev` file in the root of the project. Copy the contents of `.env.example` into this file (you can change the password to your own password if you wish)
- Run `npm run prepare:RSK:testnet`. This will create the docker-compose.yml file and the subgraph.yaml file from the template files.
- Run `npm run dev:up`. This will run docker compose up -d and pass in your environment file.
- Run `npm run codegen`. This will generate the ./generated folder with types and contract objects.
- Run `npm run build` to generate the build folder
- Run `npm run create-local` to start running the graph node locally
- Run `npm run deploy-local` to deploy the contents of the build folder locally
- Go to http://localhost:8000/subgraphs/name/DistributedCollective/sovryn-subgraph/graphql to see the iGraphQL GUI for your local subgraph

## Useful info

- The subgraph mappings files are written in AssemblyScript, not Typescript. AssemblyScript docs can be found here: https://www.assemblyscript.org/. Pay particular attention to the difference in the equality operator - `===` compares referencess, `==` compares values.
- If you are having issues with postgres, try deleting the `data/` directory from the subgraph root
- This subgraph takes approximately 4 hours to fully sync on mainnet

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

## Deploy Subgraph to locally hosted service

1. Add a tag with command git tag [ TAG_NAME ] . The tag should be consistent with the graph versioning
2. Run git push origin [ TAG_NAME ]
3. Go to Jenkins site: 172.20.2.229:8080
4. Select create-graphql-cluster and build with parameters
5. Log in to aws console to check that new cluster is up
6. Get GraphiQL url from aws console and add to Postman in subgraph sync environment
7. When the new subgraph has synced, we need to change the dns to new subgraph: switching DNS name to new ELB: http://172.20.2.229:8080/job/change-dns-entry-graphql/. Use dns name for new subgraph from aws console as parameter for jenkins.
8. Check that dns has switched over successfully: "prod" address: https://graphql.sovryn.app/subgraphs/name/DistributedCollective/Sovryn-subgraph/graphql

# Gotchas

- In this version of AssemblyScript, ``===`` does not behave as it does in JS/TS. ``===`` compares references, not equality. Use ``==`` for comparing equality, especially for strings: https://github.com/AssemblyScript/assemblyscript/issues/621
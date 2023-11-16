# CCIP Read Gateway

[Cloudflare Worker](https://developers.cloudflare.com/workers/) is used as the [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) gateway.

## API Routes

- `/lookup/{sender}/{data}.json` - GET - CCIP Read lookup

## Run Locally

1. Navigate to this directory: `cd worker`
2. Login to Cloudflare: `npx wrangler login`
3. Set your environment variables: `cp .dev.vars.example .dev.vars` (this is the private key for one of the addresses listed as a signer on your resolver contract)
4. Install dependencies: `yarn install`
5. Start the dev server: `yarn dev`

## Deploy to Cloudflare

1. Navigate to this directory: `cd worker`
2. Login to Cloudflare: `npx wrangler login`
3. Deploy the Worker: `yarn deploy`
4. Set your environment variable: `echo <PRIVATE_KEY> | npx wrangler secret put PRIVATE_KEY` (this is the private key for one of the addresses listed as a signer on your resolver contract)

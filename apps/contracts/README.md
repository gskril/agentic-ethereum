# Contracts

## Deployments

| Network      | Address                                    |
| ------------ | ------------------------------------------ |
| Base Sepolia | 0x00000000f899BD68d09603Bb13E02A7e06B071bd |

## Local Development

From the parent monorepo directory, install dependencies.

```bash
pnpm install
```

Navigate to the contracts directory and create a `.env` file. You don't have to change any of the values for testing purposes.

```bash
cd apps/contracts
cp .env.example .env
```

Compile contracts and run the tests.

```bash
pnpm test
```

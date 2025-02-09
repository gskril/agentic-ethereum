# Contracts

## Deployments

| Network      | Address                                    |
| ------------ | ------------------------------------------ |
| Base         | 0x00000000B5bec517B9641973230B171E3E859662 |
| Base Sepolia | 0x00000000B5bec517B9641973230B171E3E859662 |

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

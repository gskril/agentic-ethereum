# Contracts

## Deployments

| Network      | Address                                    |
| ------------ | ------------------------------------------ |
| Base         | 0x000000005bcd54E8302F81A7B62f8A8482b935Ed |
| Base Sepolia | 0x000000005bcd54E8302F81A7B62f8A8482b935Ed |

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

# Contracts

## Deployments

| Network      | Address                                    |
| ------------ | ------------------------------------------ |
| Base Sepolia | 0x00000000a3A1D9BA654e4c9855093DbF4029A382 |

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

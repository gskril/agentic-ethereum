import { GAMESHOW_CONTRACT } from 'agent/src/contract'
import { createConfig } from 'ponder'
import { http } from 'viem'

export default createConfig({
  networks: {
    base: {
      chainId: 8453,
      transport: http(process.env.PONDER_RPC_URL),
    },
  },
  contracts: {
    GameShow: {
      network: 'base',
      abi: GAMESHOW_CONTRACT.abi,
      address: GAMESHOW_CONTRACT.address,
      startBlock: Number(GAMESHOW_CONTRACT.fromBlock),
    },
  },
})

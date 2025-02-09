import { useQuery } from '@tanstack/react-query'
import { GAMESHOW_CONTRACT } from 'agent/src/contract'
import { usePublicClient } from 'wagmi'

import { wagmiConfig } from '@/lib/web3'
import { chains } from '@/lib/web3'

export function useGamePlayers(gameId: bigint) {
  const viemClient = usePublicClient({
    config: wagmiConfig,
    chainId: chains[0].id,
  })

  return useQuery({
    refetchInterval: 5000,
    queryKey: ['gamePlayers', Number(gameId)],
    queryFn: async () => {
      const filter = await viemClient.createEventFilter({
        address: GAMESHOW_CONTRACT.address,
        event: GAMESHOW_CONTRACT.abi[20],
        args: {
          gameId,
        },
        strict: true,
        fromBlock: GAMESHOW_CONTRACT.fromBlock,
      })

      const logs = await viemClient.getFilterLogs({ filter })

      console.log(logs)

      // Return an array of log.args.player
      const players = logs.map((log) => log.args.player)
      return players
    },
  })
}

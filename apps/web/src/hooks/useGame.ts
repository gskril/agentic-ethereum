import { useQuery } from '@tanstack/react-query'
import { GAMESHOW_CONTRACT } from 'agent/src/contract'
import { translateState } from 'agent/src/utils'
import { usePublicClient } from 'wagmi'

import { chains, wagmiConfig } from '@/lib/web3'

export type Game = NonNullable<ReturnType<typeof useGame>['data']>

export function useGame(opt: 'current' | 'previous') {
  const viemClient = usePublicClient({
    config: wagmiConfig,
    chainId: chains[0].id,
  })

  return useQuery({
    queryKey: ['game', opt],
    queryFn: async () => {
      const [blockTimestamp, gameCount] = await Promise.all([
        viemClient.getBlock(),
        viemClient.readContract({
          ...GAMESHOW_CONTRACT,
          functionName: 'gameCount',
        }),
      ])

      if (gameCount === 0n) {
        return null
      }

      const gameId = opt === 'current' ? gameCount - 1n : gameCount - 2n

      const [
        title,
        state,
        entryFee,
        playersLimit,
        startTime,
        duration,
        playersCount,
        winner,
      ] = await viemClient.readContract({
        ...GAMESHOW_CONTRACT,
        functionName: 'games',
        args: [gameId],
      })

      return {
        id: gameId,
        title,
        state: translateState({
          state,
          blockTimestamp: blockTimestamp.timestamp,
          startTime,
          duration,
        }),
        entryFee,
        playersLimit,
        startTime,
        duration,
        playersCount,
        winner,
      } as const
    },
  })
}

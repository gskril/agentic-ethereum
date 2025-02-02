import { useQuery } from '@tanstack/react-query'
import { GAMESHOW_CONTRACT } from 'contracts/deployments'
import { usePublicClient } from 'wagmi'

import { chains, wagmiConfig } from '@/lib/web3'

export type Game = NonNullable<ReturnType<typeof useLatestGame>['data']>

export function useLatestGame() {
  const viemClient = usePublicClient({
    config: wagmiConfig,
    chainId: chains[0].id,
  })

  return useQuery({
    queryKey: ['latestGame'],
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

      const gameId = gameCount - 1n

      const [
        title,
        state,
        entryFee,
        playersLimit,
        startTime,
        duration,
        playersCount,
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
      } as const
    },
  })
}

function translateState({
  state,
  blockTimestamp,
  startTime,
  duration,
}: {
  state: number
  blockTimestamp: bigint
  startTime: bigint
  duration: bigint
}) {
  switch (state) {
    case 0:
      return 'empty'
    case 1:
      if (blockTimestamp > startTime) {
        return 'waiting-start'
      }

      return 'open'
    case 2:
      if (blockTimestamp > startTime + duration) {
        return 'waiting-settle'
      }

      return 'active'
    default:
      return 'settled'
  }
}

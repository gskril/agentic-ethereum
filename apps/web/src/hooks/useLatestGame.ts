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
      const gameCount = await viemClient.readContract({
        ...GAMESHOW_CONTRACT,
        functionName: 'gameCount',
      })

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
        state: translateState(state),
        entryFee,
        playersLimit,
        startTime,
        duration,
        playersCount,
      } as const
    },
  })
}

function translateState(state: number) {
  switch (state) {
    case 0:
      return 'empty'
    case 1:
      // TODO: return "waiting-start" if users can't join anymore, but the game hasn't been started yet
      return 'open'
    case 2:
      // TODO: return "waiting-settle" if users can't answer anymore, but the game hasn't been settled yet
      return 'active'
    default:
      return 'settled'
  }
}

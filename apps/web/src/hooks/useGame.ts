import type { ReplaceBigInts } from '@ponder/utils'
import { useQuery } from '@tanstack/react-query'
import * as schema from 'indexer/schema'

export type Game = NonNullable<ReturnType<typeof useGames>['data']>[number]

const INDEXER_URL = new URL(process.env.NEXT_PUBLIC_INDEXER_URL as string)

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const res = await fetch(INDEXER_URL + 'games')
      const json = (await res.json()) as ReplaceBigInts<
        typeof schema.game.$inferSelect,
        string
      >[]

      return json.map((game) => ({
        ...game,
        id: BigInt(game.id),
        entryFee: BigInt(game.entryFee),
        playersLimit: BigInt(game.playersLimit),
        startTime: BigInt(game.startTime),
        duration: BigInt(game.duration),
        endTime: BigInt(game.endTime),
        playersCount: BigInt(game.playersCount),
        questionsCount: BigInt(game.questionsCount),
        prize: BigInt(game.prize ?? 0),
      }))
    },
  })
}

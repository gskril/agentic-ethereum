'use client'

import { useEnsName } from 'wagmi'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Game } from '@/hooks/useLatestGame'
import { truncateAddress } from '@/lib/utils'

type Props = {
  game: Game
}

export function WinnerChosen({ game }: Props) {
  const { data: name } = useEnsName({
    address: game.winner,
    chainId: 1,
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold">{game.title}</h1>
        </CardHeader>
        <CardContent>
          <p>Winner: {name ?? truncateAddress(game.winner)}</p>
        </CardContent>
      </Card>
    </div>
  )
}

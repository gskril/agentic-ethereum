'use client'

import { useEffect } from 'react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Game } from '@/hooks/useLatestGame'

type Props = {
  game: Game
  refetch: () => void
}

export function WaitingToSettle({ game, refetch }: Props) {
  // Call refetch every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 10_000)

    return () => clearInterval(interval)
  }, [refetch])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-4">
      <Card className="w-full max-w-sm bg-white shadow-lg">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold text-zinc-900">
            {game.title}
          </h1>
        </CardHeader>
        <CardContent>
          <p>Waiting for the agent to settle the game and pick a winner...</p>
        </CardContent>
      </Card>
    </div>
  )
}

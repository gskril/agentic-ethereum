'use client'

import { useEffect } from 'react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Game } from '@/hooks/useLatestGame'

type Props = {
  game: Game
  refetch: () => void
}

export function WaitingToStart({ game, refetch }: Props) {
  // Call refetch every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 10_000)

    return () => clearInterval(interval)
  }, [refetch])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <Card className="w-full max-w-sm bg-white shadow-lg">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold">{game.title}</h1>
        </CardHeader>
        <CardContent>
          <p>Waiting for the agent to start the game...</p>
        </CardContent>
      </Card>
    </div>
  )
}

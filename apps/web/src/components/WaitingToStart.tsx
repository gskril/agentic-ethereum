'use client'

import { useEffect } from 'react'

import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import { Game } from '@/hooks/useGame'

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
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold">{game.title}</h1>

          <CardDescription className="text-center">
            Waiting for host agent to start the game...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

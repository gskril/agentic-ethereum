'use client'

import { useEffect } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { Game } from '@/hooks/useGame'

type Props = {
  game: Game
  refetch: () => void
}

export function WaitingToSettle({ game, refetch }: Props) {
  // Call refetch every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5_000)

    return () => clearInterval(interval)
  }, [refetch])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-6">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold">{game.title}</h1>

          <CardDescription className="text-center">
            Waiting for the host agent to choose a winner...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

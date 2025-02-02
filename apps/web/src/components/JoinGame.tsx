'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Users } from 'lucide-react'
import React, { useEffect } from 'react'
import { formatEther } from 'viem'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Game } from '@/hooks/useLatestGame'
import { secondsToTime } from '@/lib/utils'

export function JoinGame({ game }: { game: Game }) {
  const ticketsLeft = Number(game.playersLimit) - Number(game.playersCount)
  const soldPercentage =
    (Number(game.playersCount) / Number(game.playersLimit)) * 100

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-4">
      <ConnectButton showBalance={false} />

      <Card className="w-full max-w-sm bg-white shadow-lg">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold text-zinc-900">
            {game.title}
          </h1>
        </CardHeader>
        <CardContent>
          {/* Use the new component */}
          <CountdownTimer startTime={Number(game.startTime)} />

          {/* Game Details */}
          <div className="mb-8 space-y-4">
            {/* <div className="flex items-center justify-between text-sm text-zinc-600">
              <span>Questions</span>
              <span className="font-medium">{game.questionsCount}</span>
            </div> */}

            <div className="flex items-center justify-between text-sm text-zinc-600">
              <span>Duration</span>
              <span className="font-medium">
                {secondsToTime(game.duration).hours}h{' '}
                {secondsToTime(game.duration).minutes}m{' '}
                {secondsToTime(game.duration).seconds}s
              </span>
            </div>

            {/* Ticket Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>Available Tickets</span>
                </div>
                <span className="font-medium">
                  {ticketsLeft}/{game.playersLimit}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100">
                <div
                  className="h-2 rounded-full bg-zinc-900 transition-all duration-500"
                  style={{ width: `${soldPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Entry Fee and Button */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-zinc-600">Entry Fee</span>
              <span className="text-xl font-medium">
                {formatEther(game.entryFee)} ETH
              </span>
            </div>

            <Button className="w-full bg-zinc-900 py-6 font-medium text-white hover:bg-zinc-800">
              Enter Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const CountdownTimer = React.memo(({ startTime }: { startTime: number }) => {
  const [now, setNow] = React.useState(Math.floor(Date.now() / 1000))
  const timeLeft = secondsToTime(Number(startTime) - now)

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mb-10 grid grid-cols-3 gap-2">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="font-mono text-4xl font-bold text-zinc-900">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-sm capitalize text-zinc-500">{unit}</div>
        </div>
      ))}
    </div>
  )
})

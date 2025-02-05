'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { GAMESHOW_CONTRACT } from 'agent/src/contract'
import { Users } from 'lucide-react'
import React, { useEffect } from 'react'
import { formatEther } from 'viem'
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { CountdownTimer } from '@/components/CountdownTimer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Game } from '@/hooks/useLatestGame'
import { secondsToTime } from '@/lib/utils'

import { Alert, AlertDescription, AlertTitle } from './ui/alert'

type Props = {
  game: Game
  refetch: () => void
}

export function JoinGame({ game, refetch }: Props) {
  const { address } = useAccount()

  const alreadyJoined = useReadContract({
    ...GAMESHOW_CONTRACT,
    functionName: 'joinedGame',
    // @ts-expect-error This only runs when the address is defined
    args: [game.id, address],
    enabled: !!address,
  })

  const tx = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash: tx.data })
  const simulation = useSimulateContract({
    ...GAMESHOW_CONTRACT,
    functionName: 'joinGame',
    args: [game.id],
    value: game.entryFee,
    query: {
      enabled: !alreadyJoined.data,
    },
  })

  useEffect(() => {
    if (receipt.data) {
      refetch()
      alreadyJoined.refetch()
    }
  }, [receipt.data])

  async function handleJoinGame() {
    if (!simulation.data) return alert('Unreachable code')
    tx.writeContract(simulation.data.request)
  }

  const ticketsLeft = Number(game.playersLimit) - Number(game.playersCount)
  const soldPercentage =
    (Number(game.playersCount) / Number(game.playersLimit)) * 100

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-4">
      <ConnectButton />

      <Card className="w-full max-w-sm bg-white shadow-lg">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold text-zinc-900">
            {game.title}
          </h1>
        </CardHeader>
        <CardContent>
          <CountdownTimer
            targetTime={game.startTime}
            onComplete={refetch}
            showHours={true}
          />

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

            <Button
              className="w-full bg-zinc-900 py-6 font-medium text-white hover:bg-zinc-800"
              disabled={!simulation.data || alreadyJoined.data}
              onClick={handleJoinGame}
              loading={
                simulation.isLoading || tx.isPending || receipt.isLoading
              }
            >
              {alreadyJoined.data ? 'Joined' : 'Enter Game'}
            </Button>

            {simulation.error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{simulation.error.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

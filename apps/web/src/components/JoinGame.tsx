'use client'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import { GAMESHOW_CONTRACT } from 'agent/src/contract'
import React, { useEffect } from 'react'
import { Address, formatEther, zeroAddress } from 'viem'
import {
  useAccount,
  useEnsName,
  useReadContract,
  useSimulateContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { CountdownTimer } from '@/components/CountdownTimer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Game } from '@/hooks/useGame'
import { useGamePlayers } from '@/hooks/useGamePlayers'
import { secondsToTime } from '@/lib/utils'
import { chains } from '@/lib/web3'

import { WinnerCard } from './WinnerChosen'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Divider } from './ui/divider'

type Props = {
  game: Game
  previousGame: Game | undefined
  refetch: () => void
}

export function JoinGame({ game, previousGame, refetch }: Props) {
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { switchChain } = useSwitchChain()

  const alreadyJoined = useReadContract({
    ...GAMESHOW_CONTRACT,
    functionName: 'joinedGame',
    // @ts-expect-error This only runs when the address is defined
    args: [game.id, address],
    enabled: !!address,
    chainId: chains[0].id,
  })

  const tx = useWriteContract()
  const receipt = useWaitForTransactionReceipt({
    hash: tx.data,
    chainId: chains[0].id,
  })

  const simulation = useSimulateContract({
    ...GAMESHOW_CONTRACT,
    functionName: 'joinGame',
    args: [game.id],
    value: game.entryFee,
    chainId: chains[0].id,
    query: {
      enabled: alreadyJoined.data === false,
    },
  })

  // Call refetch every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5_000)

    return () => clearInterval(interval)
  }, [refetch])

  async function handleJoinGame() {
    if (!simulation.data) return alert('Unreachable code')
    switchChain({ chainId: chains[0].id })
    tx.writeContract({
      ...GAMESHOW_CONTRACT,
      functionName: 'joinGame',
      args: [game.id],
      value: game.entryFee,
      chainId: chains[0].id,
    })
  }

  const ticketsLeft = Number(game.playersLimit) - Number(game.playersCount)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-6">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold">{game.title}</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <CountdownTimer
            targetTime={game.startTime}
            onComplete={refetch}
            showHours={true}
            leading="Starting in..."
          />

          <Divider />

          {/* Game Details */}
          <div className="flex w-full justify-around">
            <div className="text-center">
              <span className="text-primary block text-3xl font-semibold">
                {secondsToTime(game.duration).minutes}m{' '}
                {secondsToTime(game.duration).seconds !== 0 &&
                  secondsToTime(game.duration).seconds + 's'}
              </span>
              <span className="text-sm">Duration</span>
            </div>

            <div className="text-center">
              <span className="text-primary block text-3xl font-semibold">
                {formatEther(game.entryFee)} ETH
              </span>
              <span className="text-sm">Entry Fee</span>
            </div>
          </div>

          <Divider />

          {/* Ticket Progress */}
          <div className="flex flex-col items-center gap-2">
            {game.players && (
              <div className="flex items-center">
                {game.players.map((player) => (
                  <PlayerAvatar key={player} address={player} />
                ))}
              </div>
            )}

            <span className="text-sm font-semibold">
              {ticketsLeft}/{game.playersLimit} seats available
            </span>
          </div>

          {/* Entry Fee and Button */}
          <div>
            {!address && <Button onClick={openConnectModal}>Connect</Button>}

            {address && (
              <Button
                disabled={!simulation.data || alreadyJoined.data}
                onClick={handleJoinGame}
                loading={
                  simulation.isLoading || tx.isPending || receipt.isLoading
                }
              >
                {alreadyJoined.data ? 'Joined' : 'Join Game'}
              </Button>
            )}

            {simulation.error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {simulation.error.message.includes(
                    'exceeds the balance of the account'
                  )
                    ? 'Insufficient ETH balance'
                    : simulation.error.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {previousGame && previousGame.winner !== zeroAddress && (
        <WinnerCard game={previousGame} />
      )}
    </div>
  )
}

function PlayerAvatar({ address }: { address: Address }) {
  const { data: name } = useEnsName({ address, chainId: 1 })

  return (
    <img
      src={`https://ens-api.gregskril.com/avatar/${name ?? 'blah'}?width=64`}
      className="border-card h-8 w-8 rounded-full border-2 object-cover [&:not(:last-child)]:-mr-2"
      title={name ?? address}
      width={32}
      height={32}
    />
  )
}

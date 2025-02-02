'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { GAMESHOW_CONTRACT } from 'contracts/deployments'
import { Address, parseEther } from 'viem'
import { UseWriteContractReturnType, useWriteContract } from 'wagmi'

import { useContractEvents } from '@/hooks/useContractEvents'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'

export function AdminPanel() {
  const tx = useWriteContract()

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <ConnectButton showBalance />

      <CreateGameForm tx={tx} />
      <StartGameForm tx={tx} />
      <SettleGameForm tx={tx} />
      <ContractEvents tx={tx} />
    </div>
  )
}

function CreateGameForm({ tx }: { tx: UseWriteContractReturnType }) {
  function handleCreateGame(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const name = formData.get('name') as string
    const entryFee = formData.get('entryFee') as string
    const playersLimit = formData.get('playersLimit') as string
    const expectedStartTime = formData.get('expectedStartTime') as string
    const duration = formData.get('duration') as string
    const questionsCount = formData.get('questionsCount') as string

    tx.writeContract({
      ...GAMESHOW_CONTRACT,
      functionName: 'createGame',
      args: [
        name, // _name,
        parseEther(entryFee), // _entryFee,
        BigInt(playersLimit), // _playersLimit,
        BigInt(expectedStartTime), // _expectedStartTime,
        BigInt(duration), // _duration,
        BigInt(questionsCount), // _questionsCount
      ],
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Game</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateGame} className="flex flex-col gap-4">
          <Input type="text" name="name" placeholder="Game Name" />
          <Input
            type="number"
            name="entryFee"
            step="0.001"
            placeholder="Entry Fee in ETH"
          />
          <Input
            type="number"
            name="playersLimit"
            placeholder="Players Limit"
          />
          <Input
            type="number"
            name="expectedStartTime"
            placeholder="Expected Start Time (unix timestamp)"
            defaultValue={Math.floor(Date.now() / 1000) + 100}
          />
          <Input
            type="number"
            name="duration"
            placeholder="Duration (seconds)"
          />
          <Input
            type="number"
            name="questionsCount"
            placeholder="Questions Count"
          />
          <Button type="submit">Create Game</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function StartGameForm({ tx }: { tx: UseWriteContractReturnType }) {
  function handleStartGame(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const gameId = formData.get('gameId') as string
    const questions = formData.get('questions') as string

    const questionsArray = questions
      .split(',')
      .map((question) => question.trim())

    tx.writeContract({
      ...GAMESHOW_CONTRACT,
      functionName: 'startGame',
      args: [
        BigInt(gameId), // _gameId,
        questionsArray, // _questions
      ],
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Start Game</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleStartGame} className="flex flex-col gap-4">
          <Input type="number" name="gameId" placeholder="Game ID" />
          <Input
            type="text"
            name="questions"
            placeholder="Questions (comma separated)"
          />
          <Button type="submit">Start Game</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function SettleGameForm({ tx }: { tx: UseWriteContractReturnType }) {
  function handleSettleGame(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const gameId = formData.get('gameId') as string
    const winner = formData.get('winner') as Address

    tx.writeContract({
      ...GAMESHOW_CONTRACT,
      functionName: 'settleGame',
      args: [
        BigInt(gameId), // _gameId,
        winner, // _winner
      ],
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Settle Game</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSettleGame} className="flex flex-col gap-4">
          <Input type="number" name="gameId" placeholder="Game ID" />
          <Input type="text" name="winner" placeholder="Winner" />
          <Button type="submit">Settle Game</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function ContractEvents({ tx }: { tx: UseWriteContractReturnType }) {
  const { data: events } = useContractEvents({ queryKey: tx.data })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contract Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative flex flex-col gap-6 overflow-scroll">
          {events?.map(({ eventName, args }) => (
            <div
              key={`${eventName}-${JSON.stringify(args)}`}
              className="relative max-w-full [&:not(:last-child)]:border-b [&:not(:last-child)]:pb-6"
            >
              <p>{eventName}</p>
              <pre className="max-w-full">
                {Object.entries(args).map(([key, value]) => (
                  <p key={key}>
                    {key}: {value}
                  </p>
                ))}
              </pre>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

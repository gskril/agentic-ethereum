'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { GAMESHOW_CONTRACT } from 'contracts/deployments'
import { parseEther } from 'viem'
import { useWriteContract } from 'wagmi'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'

export function AdminPanel() {
  const tx = useWriteContract()

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
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <ConnectButton showBalance />

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
    </div>
  )
}

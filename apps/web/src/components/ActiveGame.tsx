'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { GAMESHOW_CONTRACT } from 'agent/src/contract'
import { toHex } from 'viem'
import { packetToBytes } from 'viem/ens'
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { CountdownTimer } from '@/components/CountdownTimer'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useContractEvents } from '@/hooks/useContractEvents'
import { Game } from '@/hooks/useLatestGame'

type Props = {
  game: Game
  refetch: () => void
}

// This could be removed if inference was improved in `useContractEvents`
type GameStartedEvent = {
  endTime: bigint
  gameId: bigint
  questions: string[]
  startTime: bigint
}

export function ActiveGame({ game, refetch }: Props) {
  const { address } = useAccount()

  const isJoined = useReadContract({
    ...GAMESHOW_CONTRACT,
    functionName: 'joinedGame',
    // @ts-expect-error This only runs when the address is defined
    args: [game.id, address],
    enabled: !!address,
  })

  const gameStartedEvents = useContractEvents({
    eventName: 'GameStarted',
    queryKey: ['questions', game.id],
  })

  const gameStartedEvent = gameStartedEvents.data?.[0]?.args as GameStartedEvent

  const tx = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash: tx.data })

  async function handleSubmitAnswers(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const answers = Object.fromEntries(formData.entries())
    const responses = Object.values(answers).map((answer) =>
      toHex(packetToBytes(answer as string))
    )

    tx.writeContract({
      ...GAMESHOW_CONTRACT,
      functionName: 'submitResponses',
      args: [game.id, responses],
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-4">
      <ConnectButton />

      <Card className="w-full max-w-sm bg-white shadow-lg">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold text-zinc-900">
            {game.title}
          </h1>

          <CardDescription className="text-center">
            You can submit your answers as many times as you&apos;d like until
            the timer runs out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CountdownTimer
            targetTime={game.startTime + game.duration}
            onComplete={refetch}
            showHours={false}
          />

          <form onSubmit={handleSubmitAnswers}>
            {/* Questions */}
            <div className="mb-8 space-y-6">
              {gameStartedEvent?.questions.map(
                (question: string, index: number) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-700">
                      {question}
                    </label>
                    <Input
                      placeholder="Enter your answer"
                      name={`question-${index}`}
                    />
                  </div>
                )
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-zinc-900 py-6 font-medium text-white hover:bg-zinc-800"
              loading={tx.isPending || receipt.isLoading}
              disabled={!isJoined.data}
            >
              {isJoined.data ? 'Submit Answers' : "You're not in this game"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

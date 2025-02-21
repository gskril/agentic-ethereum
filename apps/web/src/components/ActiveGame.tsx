'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { GAMESHOW_CONTRACT } from 'agent/src/contract'
import { Check } from 'lucide-react'
import { stringToBytes, toHex } from 'viem'
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
import { Game } from '@/hooks/useGame'
import { chains } from '@/lib/web3'

import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Divider } from './ui/divider'

type Props = {
  game: Game
  refetch: () => void
}

export function ActiveGame({ game, refetch }: Props) {
  const { address } = useAccount()

  const isJoined = useReadContract({
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

  function handleSubmitAnswers(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const answers = Object.fromEntries(formData.entries())
    const responses = Object.values(answers).map((answer) =>
      toHex(stringToBytes(answer as string))
    )

    tx.writeContract({
      ...GAMESHOW_CONTRACT,
      functionName: 'submitResponses',
      args: [game.id, responses],
      chainId: chains[0].id,
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-6">
      <ConnectButton chainStatus="none" showBalance={false} />

      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold">{game.title}</h1>

          <CardDescription className="text-center">
            You can submit your answers as many times as you&apos;d like until
            the timer runs out.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CountdownTimer
            targetTime={game.startTime + game.duration}
            onComplete={refetch}
          />

          <Divider />

          <form onSubmit={handleSubmitAnswers}>
            {/* Questions */}
            <div className="mb-4 space-y-4">
              {game.questions?.map((question: string, index: number) => (
                <div key={index} className="space-y-1">
                  <label
                    className="block text-sm font-medium text-zinc-700"
                    htmlFor={`question-${index}`}
                  >
                    {question}
                  </label>
                  <Input
                    placeholder="Enter your answer"
                    name={`question-${index}`}
                    id={`question-${index}`}
                  />
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-zinc-900 py-6 font-medium text-white hover:bg-zinc-800"
              loading={tx.isPending || receipt.isLoading}
              disabled={!isJoined.data}
            >
              {isJoined.data ? 'Lock it in!' : "You're not in this game"}
            </Button>

            {receipt.isSuccess && (
              <Alert variant="default" className="mt-4">
                <Check className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Resubmit to replace your answers.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

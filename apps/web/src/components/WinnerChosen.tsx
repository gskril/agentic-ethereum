'use client'

import { formatEther } from 'viem'
import { useEnsAvatar, useEnsName } from 'wagmi'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Game } from '@/hooks/useLatestGame'
import { truncateAddress } from '@/lib/utils'

type Props = {
  game: Game
}

export function WinnerChosen({ game }: Props) {
  const { data: name } = useEnsName({
    address: game.winner,
    chainId: 1,
  })

  const { data: avatar } = useEnsAvatar({
    name: name ?? undefined,
    chainId: 1,
  })

  const feesPaid = game.entryFee * game.playersCount
  const fee = feesPaid / 10n // 10% fee
  const prize = feesPaid - fee

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Previous Game</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {avatar && (
            <img
              src={`https://ens-api.gregskril.com/avatar/${name}?width=64`}
              className="mb-4 h-16 w-16 rounded-full"
            />
          )}

          <span className="text-xl font-bold">
            {name ?? truncateAddress(game.winner)}
          </span>

          <span>won</span>

          <span className="text-xl font-bold">{formatEther(prize)} ETH</span>
        </CardContent>
      </Card>
    </div>
  )
}

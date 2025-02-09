'use client'

import { useEffect } from 'react'
import { formatEther, zeroAddress } from 'viem'
import { useEnsAvatar, useEnsName } from 'wagmi'

import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Game } from '@/hooks/useGame'
import { truncateAddress } from '@/lib/utils'

type Props = {
  game: Game
  showTitle?: boolean
  refetch?: () => void
}

export function WinnerChosen({ game, showTitle = false, refetch }: Props) {
  // Call refetch every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch?.()
    }, 10_000)

    return () => clearInterval(interval)
  }, [refetch])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-6">
      <WinnerCard game={game} showTitle={showTitle} />
    </div>
  )
}

export function WinnerCard({ game, showTitle = true }: Props) {
  const { data: name } = useEnsName({
    address: game.winner,
    chainId: 1,
    query: {
      enabled: game.winner !== zeroAddress,
    },
  })

  const { data: avatar } = useEnsAvatar({
    name: name ?? undefined,
    chainId: 1,
  })

  const feesPaid = game.entryFee * game.playersCount
  const fee = feesPaid / 10n // 10% fee
  const prize = feesPaid - fee

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader className="flex flex-col items-center">
        {showTitle && (
          <CardTitle className="mb-4 text-center">Previous Game</CardTitle>
        )}
        {(() => {
          if (game.winner === zeroAddress) {
            return <div>No winner</div>
          }

          return (
            <>
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

              <span className="text-xl font-bold">
                {formatEther(prize)} ETH
              </span>
            </>
          )
        })()}
      </CardHeader>
    </Card>
  )
}

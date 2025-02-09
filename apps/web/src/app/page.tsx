'use client'

import frameSDK from '@farcaster/frame-sdk'
import { AlertCircle, Loader2 } from 'lucide-react'

import { ActiveGame } from '@/components/ActiveGame'
import { JoinGame } from '@/components/JoinGame'
import { WaitingToSettle } from '@/components/WaitingToSettle'
import { WaitingToStart } from '@/components/WaitingToStart'
import { WinnerChosen } from '@/components/WinnerChosen'
import { useFrame } from '@/components/providers/FrameSDKProvider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useGame } from '@/hooks/useGame'

const containerClasses =
  'flex h-screen items-center justify-center max-w-sm mx-auto'

export default function Home() {
  const { data, isLoading, refetch } = useGame('current')
  const { context, refetch: refetchFrame } = useFrame()

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <Loader2 size={32} className="animate-spin" />
      </div>
    )
  }

  if (context && !context.client.added) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-6">
        <Button
          onClick={async () => {
            await frameSDK.actions.addFrame()
            refetchFrame()
          }}
        >
          Add Frame to Play!
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={containerClasses}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No game found</AlertTitle>
          <AlertDescription>
            Either the contract has never been initialized, something is broken.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (data.state === 'open') {
    return <JoinGame game={data} refetch={refetch} />
  }

  if (data.state === 'waiting-start') {
    return <WaitingToStart game={data} refetch={refetch} />
  }

  if (data.state === 'active') {
    return <ActiveGame game={data} refetch={refetch} />
  }

  if (data.state === 'waiting-settle') {
    return <WaitingToSettle game={data} refetch={refetch} />
  }

  if (data.state === 'settled') {
    return <WinnerChosen game={data} refetch={refetch} />
  }

  return (
    <div className={containerClasses}>
      <p>Unhandled game state</p>
    </div>
  )
}

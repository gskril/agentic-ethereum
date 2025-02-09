'use client'

import { AlertCircle, Loader2 } from 'lucide-react'

import { ActiveGame } from '@/components/ActiveGame'
import { JoinGame } from '@/components/JoinGame'
import { WaitingToSettle } from '@/components/WaitingToSettle'
import { WaitingToStart } from '@/components/WaitingToStart'
import { WinnerChosen } from '@/components/WinnerChosen'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useGame } from '@/hooks/useGame'

const containerClasses =
  'flex h-screen items-center justify-center max-w-sm mx-auto'

export default function Home() {
  const { data, isLoading, refetch } = useGame('current')

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <Loader2 size={32} className="animate-spin" />
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

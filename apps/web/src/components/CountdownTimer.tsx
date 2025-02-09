'use client'

import React, { useEffect } from 'react'

import { secondsToTime } from '@/lib/utils'

type Props = {
  targetTime: bigint
  onComplete?: () => void
  showHours?: boolean
  leading?: string
}

export const CountdownTimer = React.memo(function CountdownTimer({
  targetTime,
  onComplete,
  showHours = true,
  leading,
}: Props) {
  const [now, setNow] = React.useState(Math.floor(Date.now() / 1000))
  const seconds = Number(targetTime) - now
  const timeLeft = secondsToTime(seconds)

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (seconds <= 0 && onComplete) {
      onComplete()
    }
  }, [seconds, onComplete])

  return (
    <div className="flex flex-col items-center gap-2">
      {leading && <span className="text-sm font-medium">{leading}</span>}

      <div
        className="grid w-full grid-cols-2 gap-2"
        style={{
          gridTemplateColumns: showHours ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
        }}
      >
        {Object.entries(timeLeft)
          .filter(([unit]) => showHours || unit !== 'hours')
          .map(([unit, value]) => (
            <div key={unit} className="text-center">
              <div className="text-primary font-mono text-4xl font-bold">
                {String(value).padStart(2, '0')}
              </div>
              <div className="text-sm capitalize">{unit}</div>
            </div>
          ))}
      </div>
    </div>
  )
})

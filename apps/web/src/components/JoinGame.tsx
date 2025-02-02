'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Users } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useChainId } from 'wagmi'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function JoinGame() {
  const title = 'Game Show'
  const questionCount = 5
  const startTime = new Date(Date.now() + 45 * 60000).getTime()
  const duration = '5 minutes'
  const entryFee = '0.05'
  const maxTickets = 15
  const soldTickets = 8
  const onEnterGame = () => console.log('Enter game clicked')

  const chainId = useChainId()
  console.log(chainId)

  const timeLeft = {
    hours: 0,
    minutes: 32,
    seconds: 41,
  }

  const ticketsLeft = maxTickets - soldTickets
  const soldPercentage = (soldTickets / maxTickets) * 100

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-sm bg-white shadow-lg">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold text-zinc-900">
            {title}
          </h1>
        </CardHeader>
        <CardContent>
          {/* Countdown Timer */}
          <div className="mb-10 grid grid-cols-3 gap-2">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="text-center">
                <div className="font-mono text-4xl font-bold text-zinc-900">
                  {String(value).padStart(2, '0')}
                </div>
                <div className="text-sm capitalize text-zinc-500">{unit}</div>
              </div>
            ))}
          </div>

          {/* Game Details */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between text-sm text-zinc-600">
              <span>Questions</span>
              <span className="font-medium">{questionCount}</span>
            </div>

            <div className="flex items-center justify-between text-sm text-zinc-600">
              <span>Duration</span>
              <span className="font-medium">{duration}</span>
            </div>

            {/* Ticket Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>Available Tickets</span>
                </div>
                <span className="font-medium">
                  {ticketsLeft}/{maxTickets}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100">
                <div
                  className="h-2 rounded-full bg-zinc-900 transition-all duration-500"
                  style={{ width: `${soldPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Entry Fee and Button */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-zinc-600">Entry Fee</span>
              <span className="text-xl font-medium">{entryFee} ETH</span>
            </div>

            <Button
              onClick={onEnterGame}
              className="w-full bg-zinc-900 py-6 font-medium text-white hover:bg-zinc-800"
            >
              Enter Game
            </Button>

            <ConnectButton />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

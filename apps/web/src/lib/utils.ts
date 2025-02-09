import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function secondsToTime(seconds: number | bigint) {
  if (Number(seconds) <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 }
  }

  const hours = Math.floor(Number(seconds) / 3600)
  const minutes = Math.floor((Number(seconds) % 3600) / 60)
  const remainingSeconds = Number(seconds) % 60
  return { hours, minutes, seconds: remainingSeconds }
}

export const BASE_URL = new URL(
  process.env.NEXT_PUBLIC_BASE_URL ||
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
)

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function secondsToTime(seconds: number | bigint) {
  const hours = Math.floor(Number(seconds) / 3600)
  const minutes = Math.floor((Number(seconds) % 3600) / 60)
  const remainingSeconds = Number(seconds) % 60
  return { hours, minutes, seconds: remainingSeconds }
}

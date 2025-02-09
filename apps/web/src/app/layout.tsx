import '@rainbow-me/rainbowkit/styles.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { ClientProviders } from '@/components/providers/ClientProviders'
import { cn } from '@/lib/utils'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = new URL(
  process.env.NEXT_PUBLIC_BASE_URL ||
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
)

export const metadata: Metadata = {
  title: 'Onchain Trivia',
  description: 'Onchain Trivia Hosted by AI',
  icons: {
    icon: '/img/icon.svg',
  },
  other: {
    'fc:frame': JSON.stringify({
      version: 'next',
      imageUrl: `${BASE_URL}/img/opengraph.jpg`,
      button: {
        title: 'Play',
        action: {
          type: 'launch_frame',
          name: 'Onchain Trivia',
          url: `${BASE_URL}`,
          splashImageUrl: `${BASE_URL}/img/icon.svg`,
          splashBackgroundColor: '#E1CFC3',
        },
      },
    }),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'bg-main')}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}

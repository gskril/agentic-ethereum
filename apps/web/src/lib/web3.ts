import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { baseSepolia, mainnet } from 'wagmi/chains'

const WALLETCONNECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID

if (!WALLETCONNECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLETCONNECT_ID')
}

const { connectors } = getDefaultWallets({
  appName: '',
  projectId: WALLETCONNECT_ID,
})

export const chains = [baseSepolia, mainnet] as const

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

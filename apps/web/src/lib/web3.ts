import { farcasterFrame } from '@farcaster/frame-wagmi-connector'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'

const WALLETCONNECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID

if (!WALLETCONNECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLETCONNECT_ID')
}

const { connectors } = getDefaultWallets({
  appName: '',
  projectId: WALLETCONNECT_ID,
})

export const chains = [base, mainnet] as const

export const wagmiConfig = createConfig({
  chains,
  connectors: [...connectors, farcasterFrame()],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ETH_RPC),
  },
})

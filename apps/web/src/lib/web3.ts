import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { GAMESHOW_CONTRACT } from 'agent/src/contract'
import { createConfig, http } from 'wagmi'
import { base, hardhat, mainnet } from 'wagmi/chains'

const WALLETCONNECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID

if (!WALLETCONNECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLETCONNECT_ID')
}

const { connectors } = getDefaultWallets({
  appName: '',
  projectId: WALLETCONNECT_ID,
})

export const chains = [hardhat, base, mainnet] as const

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [hardhat.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
  },
})

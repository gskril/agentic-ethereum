import { AgentKit } from '@coinbase/agentkit'
import { ChatOpenAI } from '@langchain/openai'

import { createGame } from './agentkit/providers'
import { LitAgentWalletProvider } from './lit/WalletProvider'

const agentKit = await AgentKit.from({
  walletProvider: new LitAgentWalletProvider(),
  actionProviders: [createGame],
})

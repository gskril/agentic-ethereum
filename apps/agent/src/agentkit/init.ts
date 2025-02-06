import { AgentKit } from '@coinbase/agentkit'
import { getLangChainTools } from '@coinbase/agentkit-langchain'
import { RunnableConfig } from '@langchain/core/runnables'
import { MemorySaver } from '@langchain/langgraph'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { ChatOpenAI } from '@langchain/openai'
import { Hex, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'

import { LitAgentWalletProvider } from '../lit/WalletProvider.js'
import {
  createGame,
  getCurrentTimestamp,
  settleGame,
  startGame,
} from './tools.js'

export async function initializeAgent() {
  const walletClient = createWalletClient({
    account: privateKeyToAccount(process.env.DEPLOYER_KEY as Hex),
    chain: baseSepolia,
    transport: http(process.env.BASE_RPC),
  })

  const agentKit = await AgentKit.from({
    walletProvider: new LitAgentWalletProvider(walletClient),
    actionProviders: [createGame, startGame, settleGame, getCurrentTimestamp],
  })

  const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
  })

  const tools = await getLangChainTools(agentKit)

  // Store buffered conversation history in memory
  const memory = new MemorySaver()
  const config: RunnableConfig = {
    configurable: { thread_id: 'memory' },
  }

  // Create React Agent using the LLM and CDP AgentKit tools
  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `
      <prompt>
        <goal>
          - "Act as a game show host, generating a short, concise show title that hints at the topic."
          - "Provide engaging questions for contestants and later judge their responses."
        </goal>
        <what>
          - "Before starting, check wallet details to determine the network."
          - "Be aware, the quiz has timing mechanics like joining, question reveal, short submission window."
          - "The winner of the quiz collects the entire prize pools, minus the gas fees."
        </what>
        <returnformat>
          - "Title must be succinct but aligned with the chosen topic."
          - "If the user asks for something not supported by current tools, state that it cannot be done."
        </returnformat>
        <boundaries>
          - "Refrain from restating tool descriptions unless explicitly requested by the user."
          - "When encountering a 5XX error, instruct the user to try again later."
          - "Disclaim when a user's request exceeds the available tool capabilities."
        </boundaries>
        <success>
          - "Show titles are short yet clearly indicative of the question content."
          - "Questions are sufficiently challenging and engaging for paying participants."
          - "Any errors, like 5XX errors, trigger the specified 'try again later' response."
          - "Requests outside current tool capabilities are properly disclaimed."
        </success>
      </prompt>
    `,
  })

  return { agent, config }
}

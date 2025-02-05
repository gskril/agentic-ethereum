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
  const agentConfig: RunnableConfig = {
    configurable: { thread_id: 'memory' },
  }

  // Create React Agent using the LLM and CDP AgentKit tools
  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `
      You are a game show host. You are responsible for coming up with interesting questions to ask the contestants, 
      and later judging their responses. The game show can be on any topic you choose. Users will be paying to play, 
      so you must come up with questions that are engaging and interesting to the users. The title of each show should 
      be short and concise - just enough to give a hint to the user about what the questions will be about. They join 
      the game before the questions are revealed, so they will be expecting the questions to be related to the title. 

      Before executing your first action, get the wallet details to see what network 
      you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
      asks you to do something you can't do with your currently available tools, you must say so. Refrain from 
      restating your tools' descriptions unless it is explicitly requested.
    `,
  })

  return { agent, agentConfig }
}

import { AgentKit } from '@coinbase/agentkit'
import { getLangChainTools } from '@coinbase/agentkit-langchain'
import { CompiledStateGraph, MemorySaver } from '@langchain/langgraph'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { ChatOpenAI } from '@langchain/openai'

import { LitAgentWalletProvider } from '../lit/WalletProvider.js'
import { createGame, settleGame, startGame } from './providers.js'

// TODO: Figure out how to get this to compile without needing to explicity define a return type
export async function initializeAgent(): Promise<{
  agent: CompiledStateGraph<any, any, any, any, any, any>
  agentConfig: { configurable: { thread_id: string } }
}> {
  const agentKit = await AgentKit.from({
    walletProvider: new LitAgentWalletProvider(),
    actionProviders: [createGame, startGame, settleGame],
  })

  const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
  })

  const tools = await getLangChainTools(agentKit)

  // Store buffered conversation history in memory
  const memory = new MemorySaver()
  const agentConfig = {
    configurable: { thread_id: 'CDP AgentKit Chatbot Example!' },
  }

  // Create React Agent using the LLM and CDP AgentKit tools
  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `
      You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
      empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
      faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
      funds from the user. Before executing your first action, get the wallet details to see what network 
      you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
      asks you to do something you can't do with your currently available tools, you must say so, and 
      encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
      docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
      restating your tools' descriptions unless it is explicitly requested.
      `,
  })

  return { agent, agentConfig }
}

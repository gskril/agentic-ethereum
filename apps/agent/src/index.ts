import 'dotenv/config'

import { initializeAgent } from './agentkit/init.js'

const { agent, agentConfig } = await initializeAgent()

const res = await agent.invoke(
  {
    messages: [
      {
        role: 'user',
        content: 'What is the current unix timestamp in seconds?',
      },
    ],
  },
  agentConfig
)

console.log(res)

import 'dotenv/config'

import { initializeAgent } from './agentkit/init.js'

const { agent, agentConfig } = await initializeAgent()

const res = await agent.invoke(
  {
    messages: [
      {
        role: 'user',
        content:
          "Create a game that starts 120 seconds after the current unix timestamp in seconds. If it doens't work the first time, don't try again. Just explain the error and shut down.",
      },
    ],
  },
  agentConfig
)

console.log(res)

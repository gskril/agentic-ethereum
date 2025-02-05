import 'dotenv/config'

import { initializeAgent } from './agentkit/init.js'

const { agent } = await initializeAgent()

const res = await agent.invoke({
  messages: ['hi'],
})

console.log(res)

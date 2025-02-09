import 'dotenv/config'

import { startAgent } from './agentkit/agent.js'

const interval = Number(process.env.AGENT_INTERVAL) ?? 10
await startAgent({ interval })

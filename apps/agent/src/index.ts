import 'dotenv/config'

import { startAgent } from './agentkit/agent.js'

await startAgent({ interval: 10 })

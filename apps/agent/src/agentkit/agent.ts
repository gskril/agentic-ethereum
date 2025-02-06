import { AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'

import { initializeAgent } from './init.js'

type RunAgentOptions = {
  interval: number
}

// const steps = [
//   "Create a game that starts 120 seconds after the current unix timestamp in seconds. If it doens't work the first time, don't try again. Just explain the error and shut down.",
//   'Based on your most recently created game, come up with a list of relevant questions. They should be fun and engaging for users to answer with a sentence or less.',
// ]

// TODO: Write a prompt that runs in a loop, and allows the agent to detect what stage of a game it is in and host it accordingly.
const prompt = 'Create a game'

export async function startAgent({ interval }: RunAgentOptions) {
  const { agent, config } = await initializeAgent()

  while (true) {
    try {
      const stream = await agent.stream(
        { messages: [new HumanMessage(prompt)] },
        config
      )

      // Log output in realtime
      for await (const _chunk of stream) {
        const chunk = _chunk as {
          agent: { messages: AIMessage[] }
          tools: { messages: ToolMessage[] }
        }

        if (chunk.agent) {
          const text = chunk.agent.messages[0].content
          const toolCall = chunk.agent.messages[0].tool_calls?.[0]

          if (text) console.log('Agent:\n', text, '\n')

          if (toolCall) {
            console.log(`Calling ${toolCall.name}`)
            if (Object.keys(toolCall.args).length > 0) {
              console.log(toolCall.args)
            }
            console.log('')
          }
        } else if (chunk.tools) {
          console.log(`Tool ${chunk.tools.messages[0].name} output:`)
          console.log(chunk.tools.messages[0].content, '\n')
        } else {
          console.log('Unknown chunk', chunk, '\n')
        }
      }

      console.log('-------------------\n')

      await new Promise((resolve) => setTimeout(resolve, interval * 1000))
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message)
      }
      process.exit(1)
    }
  }
}

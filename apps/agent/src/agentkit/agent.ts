import { AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'

import { initializeAgent } from './init.js'

type RunAgentOptions = {
  interval: number
}

const prompt =
  'Check the most recent game state. The following are instructions to do depending on the game state and time:\n' +
  'If there is not an ongoing game (state is "empty" or "settled"), create a new one. The title should be unique, engaging, and different from the past game titles. The `expectedStartTime` should be the current unix timestamp + (5-10 minutes in seconds).\n' +
  'If you get a `CannotCreateGame()` error, try increasing the `expectedStartTime` by 300 seconds and try again.\n' +
  'When players join the game, send a notification to their Ethereum address to let them know that they should get another notification when the game starts.\n' +
  'If the state is "open" or "active" do not do anything.\n' +
  'If the state is "waiting-start", go ahead and start the game, and notify the players that the game is beginning.\n' +
  'If the state is "waiting-settle", gather the responses, judge them based on the game title you created, and pick a winner to settle the game.\n' +
  "Don't do anything outside of these steps."

export async function startAgent({ interval }: RunAgentOptions) {
  console.log(`Starting agent with a ${interval} second interval...\n`)
  const { agent, config } = await initializeAgent()

  while (true) {
    await runAgentTask()
    await new Promise((resolve) => setTimeout(resolve, interval * 1000))
  }

  async function runAgentTask() {
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
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message)
      }
      process.exit(1)
    }
  }
}

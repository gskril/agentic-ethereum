import { EvmWalletProvider, customActionProvider } from '@coinbase/agentkit'
import { GAMESHOW_CONTRACT } from 'contracts/deployments'
import { TransactionReceipt, encodeFunctionData } from 'viem'
import { z } from 'zod'

const createGameSchema = z.object({
  title: z.string().describe('The title of the game'),
  entryFee: z
    .bigint()
    .describe('The entry fee of the game in Ether, from 0.001 to 0.01'),
  playersLimit: z
    .bigint()
    .describe('The maximum number of players, from 5 to 10'),
  expectedStartTime: z
    .bigint()
    .describe(
      'The expected start time of the game as a unix timestamp (seconds)'
    ),
  duration: z
    .bigint()
    .describe('The duration of the game in seconds, from 60 to 180'),
  questionsCount: z
    .bigint()
    .describe('The number of questions in the game, from 3 to 10'),
})

export const createGame = customActionProvider<EvmWalletProvider>({
  name: 'create_game',
  description: 'Create a new game show',
  schema: createGameSchema,
  invoke: async (walletProvider, args: z.infer<typeof createGameSchema>) => {
    const calldata = encodeFunctionData({
      ...GAMESHOW_CONTRACT,
      functionName: 'createGame',
      args: [
        args.title,
        args.entryFee,
        args.playersLimit,
        args.expectedStartTime,
        args.duration,
        args.questionsCount,
      ],
    })

    const txHash = await walletProvider.sendTransaction({
      to: GAMESHOW_CONTRACT.address,
      data: calldata,
    })

    const receipt: TransactionReceipt =
      await walletProvider.waitForTransactionReceipt(txHash)

    if (receipt.status !== 'success') {
      throw new Error('Game creation failed')
    }

    return `A new game titled "${args.title}" has been created`
  },
})

import { EvmWalletProvider, customActionProvider } from '@coinbase/agentkit'
import {
  EncodeFunctionDataParameters,
  TransactionReceipt,
  decodeEventLog,
  encodeFunctionData,
  isAddress,
  parseEther,
} from 'viem'
import { z } from 'zod'

import { GAMESHOW_CONTRACT } from '../contract.js'
import { LitAgentWalletProvider } from '../lit/WalletProvider.js'

const createGameSchema = z.object({
  title: z.string().describe('The title of the game'),
  entryFee: z
    .number()
    .describe('The entry fee of the game in Ether, from 0.001 to 0.01'),
  playersLimit: z
    .number()
    .describe('The maximum number of players, from 5 to 10'),
  expectedStartTime: z
    .number()
    .describe(
      'The expected start time of the game as a unix timestamp (seconds)'
    ),
  duration: z
    .number()
    .describe('The duration of the game in seconds, from 60 to 180'),
  questionsCount: z
    .number()
    .describe('The number of questions in the game, from 3 to 10'),
})

export const createGame = customActionProvider<LitAgentWalletProvider>({
  name: 'create_game',
  description: 'Create a new game show',
  schema: createGameSchema,
  invoke: async (walletProvider, args: z.infer<typeof createGameSchema>) => {
    const viemCall = {
      ...GAMESHOW_CONTRACT,
      functionName: 'createGame',
      args: [
        args.title,
        parseEther(args.entryFee.toString()),
        BigInt(args.playersLimit),
        BigInt(args.expectedStartTime),
        BigInt(args.duration),
        BigInt(args.questionsCount),
      ],
    } as const satisfies EncodeFunctionDataParameters

    // Simulating the call lets the LLM understand the error if something goes wrong
    await walletProvider.simulateContract(viemCall)

    const txHash = await walletProvider.sendTransaction({
      to: GAMESHOW_CONTRACT.address,
      data: encodeFunctionData(viemCall),
    })

    const receipt: TransactionReceipt =
      await walletProvider.waitForTransactionReceipt(txHash)

    if (receipt.status !== 'success') {
      throw new Error('Game creation failed')
    }

    const decodedLogs = receipt.logs.map((log) =>
      decodeEventLog({
        abi: GAMESHOW_CONTRACT.abi,
        data: log.data,
        topics: log.topics,
      })
    )

    const gameCreatedLog = decodedLogs.find(
      (log) => log.eventName === 'GameCreated'
    )

    return `A new game titled "${args.title}" has been created with ID ${gameCreatedLog?.args.gameId.toString()}`
  },
})

const startGameSchema = z.object({
  gameId: z.bigint().describe('The id of the game to start'),
  questions: z.array(z.string()).describe('The questions of the game'),
})

export const startGame = customActionProvider<EvmWalletProvider>({
  name: 'start_game',
  description: 'Start a game by setting the questions',
  schema: startGameSchema,
  invoke: async (walletProvider, args: z.infer<typeof startGameSchema>) => {
    const calldata = encodeFunctionData({
      ...GAMESHOW_CONTRACT,
      functionName: 'startGame',
      args: [args.gameId, args.questions],
    })

    const txHash = await walletProvider.sendTransaction({
      to: GAMESHOW_CONTRACT.address,
      data: calldata,
    })

    const receipt: TransactionReceipt =
      await walletProvider.waitForTransactionReceipt(txHash)

    if (receipt.status !== 'success') {
      throw new Error('Game start failed')
    }

    return `The game has been started`
  },
})

const settleGameSchema = z.object({
  gameId: z.bigint().describe('The id of the game to settle'),
  winner: z
    .string()
    .refine((val) => isAddress(val))
    .describe('The winner of the game'),
})

export const settleGame = customActionProvider<EvmWalletProvider>({
  name: 'settle_game',
  description:
    'Settle a game by decryption the responses, judging them according to the question, and send the prize to the winner',
  schema: settleGameSchema,
  invoke: async (walletProvider, args: z.infer<typeof settleGameSchema>) => {
    const calldata = encodeFunctionData({
      ...GAMESHOW_CONTRACT,
      functionName: 'settleGame',
      args: [args.gameId, args.winner],
    })

    const txHash = await walletProvider.sendTransaction({
      to: GAMESHOW_CONTRACT.address,
      data: calldata,
    })

    const receipt: TransactionReceipt =
      await walletProvider.waitForTransactionReceipt(txHash)

    if (receipt.status !== 'success') {
      throw new Error('Game settlement failed')
    }

    return `The game has been settled and the prize has been sent to the winner`
  },
})

export const getCurrentTimestamp = customActionProvider({
  name: 'get_current_timestamp',
  description: 'Get the current unix timestamp in seconds',
  schema: z.object({}),
  invoke: async () => {
    return Math.floor(Date.now() / 1000)
  },
})

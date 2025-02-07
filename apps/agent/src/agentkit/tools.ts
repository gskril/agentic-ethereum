import { customActionProvider } from '@coinbase/agentkit'
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
import { replaceBigInts } from '../replaceBigInts.js'

const createGameSchema = z.object({
  title: z.string().describe(`
    <description>
      <title>A short, concise title hinting at the game's overall topic</title>
      <instructions>This is the only detail players see before questions are revealed.</instructions>
    </description>
  `),

  entryFee: z.number().describe(`
      <description>
        <range>0.001 - 0.01 Ether</range>
        <instructions>Participants pay this fee to enter. All fees are pooled and awarded to the winner.</instructions>
      </description>
    `),

  playersLimit: z.number().describe(`
      <description>
        <range>5 - 10</range>
        <instructions>Defines the minimum and maximum number of participants allowed in a single game.</instructions>
      </description>
    `),

  expectedStartTime: z.number().describe(`
      <description>
        <timeFormat>Unix timestamp (in seconds)</timeFormat>
        <instructions>When this time is reached, questions become visible, and participants can submit answers.</instructions>
      </description>
    `),

  duration: z.number().describe(`
      <description>
        <range>60 - 180 seconds</range>
        <instructions>The total time window for submitting encrypted answers. No submissions accepted once it elapses.</instructions>
      </description>
    `),

  questionsCount: z.number().describe(`
      <description>
        <range>3 - 10</range>
        <instructions>Number of questions to be revealed once the game begins.</instructions>
      </description>
    `),
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

    return `A new game titled "${args.title}" has been created with ID ${gameCreatedLog?.args.gameId}. The game will start at ${args.expectedStartTime}. Until that time, there's nothing to do.`
  },
})

const startGameSchema = z.object({
  gameId: z.number().describe('The id of the game to start'),
  questions: z.array(z.string()).describe('The questions of the game'),
})

export const startGame = customActionProvider<LitAgentWalletProvider>({
  name: 'start_game',
  description: 'Start a game by setting the questions',
  schema: startGameSchema,
  invoke: async (walletProvider, args: z.infer<typeof startGameSchema>) => {
    const viemCall = {
      ...GAMESHOW_CONTRACT,
      functionName: 'startGame',
      args: [BigInt(args.gameId), args.questions],
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
      throw new Error('Game start failed')
    }

    const decodedLogs = receipt.logs.map((log) =>
      decodeEventLog({
        abi: GAMESHOW_CONTRACT.abi,
        data: log.data,
        topics: log.topics,
      })
    )

    const gameStartedLog = decodedLogs.find(
      (log) => log.eventName === 'GameStarted'
    )

    return (
      `Game ${args.gameId} has been started. It will end at ${gameStartedLog?.args.endTime}.` +
      `The following questions are visible to players: ${gameStartedLog?.args.questions.join(', ')}.` +
      `Until that time, there's nothing to do.`
    )
  },
})

const settleGameSchema = z.object({
  gameId: z.number().describe('The id of the game to settle'),
  winner: z
    .string()
    .refine((val) => isAddress(val))
    .describe('The winner of the game'),
})

export const settleGame = customActionProvider<LitAgentWalletProvider>({
  name: 'settle_game',
  description:
    'Settle a game by judging all user responses according to the questions you asked, and send the prize to the winner',
  schema: settleGameSchema,
  invoke: async (walletProvider, args: z.infer<typeof settleGameSchema>) => {
    const viemCall = {
      ...GAMESHOW_CONTRACT,
      functionName: 'settleGame',
      args: [BigInt(args.gameId), args.winner],
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

export const getMostRecentGame = customActionProvider<LitAgentWalletProvider>({
  name: 'get_most_recent_game',
  description: 'Get the most recent game',
  schema: z.object({}),
  invoke: async (walletProvider, _) => {
    const publicClient = walletProvider.publicClient

    const [block, gameCount] = await Promise.all([
      publicClient.getBlock(),
      publicClient.readContract({
        ...GAMESHOW_CONTRACT,
        functionName: 'gameCount',
      }),
    ])

    const gameId = gameCount - 1n

    const filter = await publicClient.createEventFilter({
      address: GAMESHOW_CONTRACT.address,
      event: GAMESHOW_CONTRACT.abi['19'],
      fromBlock: GAMESHOW_CONTRACT.fromBlock,
      args: {
        gameId,
      },
    })

    const logs = await publicClient.getFilterLogs({ filter })
    const { questionsCount } = logs[0].args

    const [title, state, , , startTime, duration] =
      await publicClient.readContract({
        ...GAMESHOW_CONTRACT,
        functionName: 'games',
        args: [gameId],
      })

    const enrichedState = translateState({
      state,
      blockTimestamp: block.timestamp,
      startTime,
      duration,
    })

    // Return less data if the game is settled not to confuse the LLM, and it doesn't influence the next game
    if (enrichedState === 'settled') {
      return JSON.stringify(
        replaceBigInts(
          {
            gameId,
            state: enrichedState,
          },
          (x) => x.toString()
        )
      )
    }

    return JSON.stringify(
      replaceBigInts(
        {
          gameId,
          title,
          state: enrichedState,
          startTime,
          endTime: startTime + duration,
          questionsCount,
        },
        (x) => x.toString()
      )
    )
  },
})

// TODO: Share this with /apps/web/hooks/useLatestGame.ts ?
function translateState({
  state,
  blockTimestamp,
  startTime,
  duration,
}: {
  state: number
  blockTimestamp: bigint
  startTime: bigint
  duration: bigint
}) {
  switch (state) {
    case 0:
      return 'empty'
    case 1:
      if (blockTimestamp > startTime) {
        return 'waiting-start'
      }

      return 'open'
    case 2:
      if (blockTimestamp > startTime + duration) {
        return 'waiting-settle'
      }

      return 'active'
    default:
      return 'settled'
  }
}

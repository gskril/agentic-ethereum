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
import { Neynar } from '../farcaster/neynar.js'
import { sendFrameNotification } from '../farcaster/notifications.js'
import { LitAgentWalletProvider } from '../lit/WalletProvider.js'

const INDEXER_URL = new URL(process.env.INDEXER_URL as string)

const createGameSchema = z.object({
  title: z.string().describe(`
    <description>
      <title>A short, concise title hinting at the game's overall topic</title>
      <instructions>This is the only detail players see before questions are revealed.</instructions>
    </description>
  `),

  entryFee: z.number().describe(`
      <description>
        <range>0.0001 - 0.002 Ether</range>
        <instructions>Participants pay this fee to enter. All fees are pooled and awarded to the winner.</instructions>
      </description>
    `),

  playersLimit: z.number().describe(`
      <description>
        <range>5 - 10</range>
        <instructions>Defines the minimum and maximum number of participants allowed in a single game.</instructions>
      </description>
    `),

  expectedStartTime: z
    .number()
    .describe(
      'When this time is reached, questions become visible, and participants can submit answers. It must be 5-10 minutes in the future, formatted in unix timestamp.'
    ),

  duration: z.number().describe(`
      <description>
        <timeFormat>Seconds</timeFormat>
        <range>60 - 180</range>
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

    // Sleep until `args.expectedStartTime`
    console.log('Sleeping until', args.expectedStartTime)
    await new Promise((resolve) =>
      setTimeout(resolve, (args.expectedStartTime - Date.now() / 1000) * 1000)
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

    // If nobody joined the game, it's settled at this point
    const gameSettledLog = decodedLogs.find(
      (log) => log.eventName === 'GameSettled'
    )

    if (gameSettledLog) {
      return `Game ${args.gameId} has been settled early because nobody joined.`
    }

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
    .describe('The Ethereum address of the winner of the game'),
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
  invoke: async () => {
    const res = await fetch(INDEXER_URL + 'games')

    if (!res.ok) {
      throw new Error('Failed to fetch most recent game')
    }

    return (await res.json())[0]
  },
})

const getResponsesSchema = z.object({
  gameId: z.number().describe('The id of the game to get responses from'),
})

export const getResponses = customActionProvider<LitAgentWalletProvider>({
  name: 'get_responses',
  description:
    "Get the responses from all players in a game, alongside a reminder of the game's questions",
  schema: getResponsesSchema,
  invoke: async (_, args: z.infer<typeof getResponsesSchema>) => {
    const res = await fetch(INDEXER_URL + `responses/${args.gameId}`)

    if (!res.ok) {
      throw new Error('Failed to fetch responses')
    }

    return await res.json()
  },
})

const notifySchema = z.object({
  address: z
    .string()
    .refine((val) => isAddress(val))
    .describe('The Ethereum address of the user to notify'),
  message: z.string().describe('The message to notify the user with'),
})

export const notify = customActionProvider({
  name: 'notify',
  description: 'Send a notification to a user by their Ethereum address',
  schema: notifySchema,
  invoke: async (_, args: z.infer<typeof notifySchema>) => {
    const neynar = new Neynar(process.env.NEYNAR_API_KEY)

    const user = await neynar.getFarcasterAccountByAddress(args.address)

    if (user.error || !user.data) {
      throw new Error(user.error)
    }

    const res = await sendFrameNotification({
      fid: user.data.fid,
      title: 'Game started',
      body: args.message,
    })

    if (res.state === 'success') {
      return `Notified user ${args.address} with the following message: "${args.message}"`
    } else {
      return `I couldn't notify user ${args.address} with the following message: "${args.message}"`
    }
  },
})

export const getPastTitles = customActionProvider({
  name: 'get_past_titles',
  description: 'Get the past titles of games',
  schema: z.object({}),
  invoke: async () => {
    const res = await fetch(INDEXER_URL + 'titles')

    if (!res.ok) {
      throw new Error('Failed to fetch past titles')
    }

    return await res.json()
  },
})

import { customActionProvider } from '@coinbase/agentkit'
import { bytesToPacket } from '@ensdomains/ensjs/utils'
import {
  EncodeFunctionDataParameters,
  TransactionReceipt,
  decodeEventLog,
  encodeFunctionData,
  isAddress,
  parseEther,
  toBytes,
} from 'viem'
import { z } from 'zod'

import { GAMESHOW_CONTRACT } from '../contract.js'
import { Neynar } from '../farcaster/neynar.js'
import { sendFrameNotification } from '../farcaster/notifications.js'
import { LitAgentWalletProvider } from '../lit/WalletProvider.js'
import { replaceBigInts } from '../replaceBigInts.js'
import { translateState } from '../utils.js'

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

    // Max block range is 1000 with DRPC (30 mins on Base)
    let fromBlock = block.number - 1000n
    let toBlock = block.number
    const players = new Array<`0x${string}`>()

    // Loop until we go back far enough to get the latest game created log
    while (true) {
      const gameCreatedFilter = await publicClient.createEventFilter({
        address: GAMESHOW_CONTRACT.address,
        event: GAMESHOW_CONTRACT.abi['20'],
        fromBlock,
        toBlock,
        args: {
          gameId,
        },
        strict: true,
      })

      const gameJoinedFilter = await publicClient.createEventFilter({
        address: GAMESHOW_CONTRACT.address,
        event: GAMESHOW_CONTRACT.abi['21'],
        fromBlock,
        toBlock,
        args: { gameId },
        strict: true,
      })

      const gameCreatedLogs = await publicClient.getFilterLogs({
        filter: gameCreatedFilter,
      })
      const gameJoinedLogs = await publicClient.getFilterLogs({
        filter: gameJoinedFilter,
      })

      for (const log of gameJoinedLogs) {
        players.push(log.args.player)
      }

      if (gameCreatedLogs.length > 0) {
        break
      }

      fromBlock -= 1000n
      toBlock -= 1000n
    }

    const [title, state, , , startTime, duration, , , questionsCount] =
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
          players: players.length > 0 ? players : undefined,
        },
        (x) => x.toString()
      )
    )
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
  invoke: async (walletProvider, args: z.infer<typeof getResponsesSchema>) => {
    const publicClient = walletProvider.publicClient
    const block = await publicClient.getBlock()
    const questions = new Array<string>()
    let fromBlock = block.number - 1000n
    let toBlock = block.number

    while (true) {
      const gameStartedFilter = await publicClient.createEventFilter({
        address: GAMESHOW_CONTRACT.address,
        event: GAMESHOW_CONTRACT.abi['23'],
        fromBlock,
        toBlock,
        args: {
          gameId: BigInt(args.gameId),
        },
        strict: true,
      })

      const gameStartedLogs = await publicClient.getFilterLogs({
        filter: gameStartedFilter,
      })

      if (gameStartedLogs.length > 0) {
        questions.push(...gameStartedLogs[0].args.questions)
        break
      }

      fromBlock -= 1000n
      toBlock -= 1000n
    }

    const filter = await publicClient.createEventFilter({
      address: GAMESHOW_CONTRACT.address,
      event: GAMESHOW_CONTRACT.abi['25'],
      fromBlock,
      args: {
        gameId: BigInt(args.gameId),
      },
      strict: true,
    })

    const logs = await publicClient.getFilterLogs({ filter })
    const allResponses = new Array<{
      player: `0x${string}`
      responses: string[]
    }>()

    for (const log of logs) {
      const { player, responses } = log.args
      const decodedResponses = responses.map((response) =>
        bytesToPacket(toBytes(response))
      )

      allResponses.push({ player, responses: decodedResponses })
    }

    return JSON.stringify({
      questions,
      responses: allResponses,
    })
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

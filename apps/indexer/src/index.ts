import { ponder } from 'ponder:registry'
import { game as gameTable, response as responseTable } from 'ponder:schema'
import { bytesToString, hexToBytes, keccak256, toHex, zeroAddress } from 'viem'

ponder.on('GameShow:GameCreated', async ({ event, context }) => {
  const { gameId, expectedStartTime, duration } = event.args

  await context.db.insert(gameTable).values({
    ...event.args,
    id: gameId,
    state: 1n,
    startTime: expectedStartTime,
    endTime: expectedStartTime + duration,
    playersCount: 0n,
    questions: [],
    winner: zeroAddress,
    players: [],
    prize: 0n,
  })
})

ponder.on('GameShow:GameJoined', async ({ event, context }) => {
  const { gameId } = event.args

  await context.db.update(gameTable, { id: gameId }).set((row) => ({
    playersCount: row.playersCount + 1n,
    players: [...row.players, event.args.player],
  }))
})

ponder.on('GameShow:GameStarted', async ({ event, context }) => {
  const { gameId, questions } = event.args

  await context.db.update(gameTable, { id: gameId }).set({
    ...event.args,
    questions: questions as string[],
    state: 2n,
  })
})

ponder.on('GameShow:ResponsesSubmitted', async ({ event, context }) => {
  const { gameId, player, responses: _responses } = event.args
  let responses = new Array<string>()

  try {
    // Clean up the responses by removing control characters
    responses = _responses.map((res) => {
      const str = bytesToString(hexToBytes(res))
      // Remove the first byte (length) and the null terminator
      return str.slice(1).replace(/\x00$/, '')
    })
  } catch {
    // Old games that encoded responses differently will be empty in the API
  }

  const game = await context.db.find(gameTable, { id: gameId })
  const { questions } = game!

  await context.db
    .insert(responseTable)
    .values({
      id: keccak256(toHex(`${gameId}-${player}`)),
      gameId,
      player,
      questions,
      responses: responses as string[],
    })
    .onConflictDoUpdate(() => ({
      responses: responses as string[],
    }))
})

ponder.on('GameShow:GameSettled', async ({ event, context }) => {
  const { gameId } = event.args

  await context.db
    .update(gameTable, {
      id: gameId,
    })
    .set({
      ...event.args,
      state: 3n,
    })
})

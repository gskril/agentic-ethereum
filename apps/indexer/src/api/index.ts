import { replaceBigInts } from '@ponder/utils'
import { Hono } from 'hono'
import { client, eq, graphql } from 'ponder'
import { db } from 'ponder:api'
import schema from 'ponder:schema'
import { createPublicClient } from 'viem'

import ponderConfig from '../../ponder.config'
import { translateState } from '../utils'

const app = new Hono()

app.use('/sql/*', client({ db, schema }))
app.use('/', graphql({ db, schema }))
app.use('/graphql', graphql({ db, schema }))

app.get('/games', async (c) => {
  const res = await db.query.game.findMany({
    orderBy: (game, { desc }) => [desc(game.id)],
    limit: 2,
  })

  const client = createPublicClient(ponderConfig.networks.base)
  const block = await client.getBlock()

  const data = res.map((game) => ({
    ...game,
    state: translateState({
      state: Number(game.state),
      blockTimestamp: block.timestamp,
      startTime: game.startTime,
      duration: game.duration,
    }),
  }))

  return c.json(replaceBigInts(data, (x) => x.toString()))
})

app.get('/responses/:gameId', async (c) => {
  const { gameId } = c.req.param()
  const res = await db.query.response.findMany({
    where: eq(schema.response.gameId, BigInt(gameId)),
  })

  const questions = res[0]?.questions
  const responses = res.map((r) => ({
    player: r.player,
    responses: r.responses,
  }))

  return c.json({ questions, responses })
})

export default app

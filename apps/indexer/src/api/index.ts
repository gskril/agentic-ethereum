import { replaceBigInts } from '@ponder/utils'
import { translateState } from 'agent/src/utils'
import { Hono } from 'hono'
import { client, eq, graphql } from 'ponder'
import { db } from 'ponder:api'
import schema from 'ponder:schema'
import { createPublicClient } from 'viem'

import ponderConfig from '../../ponder.config'

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

export default app

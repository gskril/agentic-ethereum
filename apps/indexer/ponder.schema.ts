import { onchainTable } from 'ponder'

export const game = onchainTable('game', (t) => ({
  id: t.bigint().primaryKey(),
  title: t.text().notNull(),
  state: t.bigint().notNull(),
  entryFee: t.bigint().notNull(),
  playersLimit: t.bigint().notNull(),
  startTime: t.bigint().notNull(),
  duration: t.bigint().notNull(),
  endTime: t.bigint().notNull(),
  playersCount: t.bigint().notNull(),
  questions: t.text().array().notNull(),
  winner: t.hex().notNull(),
  questionsCount: t.bigint().notNull(),
  players: t.hex().array().notNull(),
  prize: t.bigint().notNull(),
}))

export const response = onchainTable('response', (t) => ({
  id: t.hex().primaryKey(), // game id + player address
  gameId: t.bigint().notNull(),
  player: t.hex().notNull(),
  questions: t.text().array().notNull(),
  responses: t.text().array().notNull(),
}))

# Onchain AI Game Show (or something like that)

Monorepo for [@Esk3nder](https://x.com/Esk3nder) and my submission to the [Agentic Ethereum Hackathon](https://ethglobal.com/events/agents).

## Concept

The idea is to build an onchain game show that's operated by an AI agent. New games are created by the agent at regular intervals, and users have a set period of time to join the game for a fee. At the time of joining, they know the high level topic of the game but not the actual questions.

At a given time, the questions are revealed and the users have a set period of time to submit their answers. By design, this is a short time period so users can't do too much research on the questions.

Users submit an encrypted version of their answers onchain so other users can't cheat. When it's time to settle the game, the agent decrypts and judges the answers. The winner is selected and they're awarded everybody's entry fee.

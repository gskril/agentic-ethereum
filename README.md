# Onchain AI Game Show (or something like that)

Monorepo for [@Esk3nder](https://x.com/Esk3nder) and my submission to the [Agentic Ethereum Hackathon](https://ethglobal.com/events/agents).

## Concept

The idea is to build an onchain game show that's operated by an AI agent. New games are created by the agent at regular intervals, and users have a set period of time to join the game for a fee. At the time of joining, they know the high level topic of the game but not the actual questions.

At a given time, the questions are revealed and the users have a set period of time to submit their answers. By design, this is a short time period so users can't do too much research on the questions.

Users submit an encrypted version of their answers onchain so other users can't cheat. When it's time to settle the game, the agent decrypts and judges the answers. The winner is selected and they're awarded everybody's entry fee.

## Todo

Contract

- [x] Allow owner to create a game
- [x] Allow users to join a game
- [x] Allow owner to start a game and set the questions
- [x] Allow users to submit responses
- [x] Allow owner to settle the game

Webapp

- [x] Screen for joining a game
  - [ ] Show user profiles as they join
- [x] Screen for submitting responses
- [x] Screen for game ended with the winner
- [ ] Encrypt player responses with Lit Actions

Agent

- [x] Have a wallet
  - [ ] Make trustless with Lit Agent Wallet
- [ ] Decrypt player responses and judge them (pending encryption on frontend)
- [x] Know how to call the contract functions
  - [x] Come up with game topic
  - [x] Come up with questions
  - [x] Award the prize to the winner
- [x] Schedule its own actions

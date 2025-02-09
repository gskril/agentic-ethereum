import {
  loadFixture,
  time,
} from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { Address } from 'viem'

// Hardhat accounts
const account1 = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const account2 = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const deploy = async () => {
  const contract = await hre.viem.deployContract('GameShow', [
    account1, // _owner
  ])

  return { contract }
}

type GameShow = Awaited<ReturnType<typeof deploy>>['contract']

function createGame(contract: GameShow, account: Address) {
  const startTime = Math.floor(Date.now() / 1000) + 1000

  return contract.write.createGame(
    [
      'Test Game', // _title
      100n, // _entryFee
      100n, // _playersLimit
      BigInt(startTime), // _expectedStartTime
      60n, // _duration
      3n, // _questionsCount
    ],
    { account }
  )
}

function startGame(contract: GameShow, account: Address) {
  return contract.write.startGame(
    [
      0n, // _gameId
      ['Question 1', 'Question 2', 'Question 3'], // _questions
    ],
    { account }
  )
}

function settleGame(contract: GameShow, account: Address) {
  return contract.write.settleGame(
    [
      0n, // _gameId
      account2, // _winner
    ],
    { account }
  )
}

describe('Tests', function () {
  describe('Positive tests', function () {
    it('should let the owner create a game', async function () {
      const { contract } = await loadFixture(deploy)
      const gameCountBefore = await contract.read.gameCount()
      expect(gameCountBefore).to.equal(0n)
      await createGame(contract, account1)
      const gameCountAfter = await contract.read.gameCount()
      expect(gameCountAfter).to.equal(1n)

      const [
        title,
        state,
        entryFee,
        playersLimit,
        startTime,
        duration,
        playersCount,
      ] = await contract.read.games([0n])

      expect(title).to.equal('Test Game')
      expect(state).to.equal(1)
      expect(entryFee).to.equal(100n)
      expect(playersLimit).to.equal(100n)
      expect(duration).to.equal(60n)
      expect(playersCount).to.equal(0n)
    })

    it('should let any account join a game', async function () {
      const { contract } = await loadFixture(deploy)
      await createGame(contract, account1)

      // Join the game from account 2
      const [, , fee, , , , playersCount] = await contract.read.games([0n])
      await contract.write.joinGame([0n], { account: account2, value: fee })

      // Read the updated value after joining
      const [, , , , , , playersCountAfter] = await contract.read.games([0n])
      expect(playersCountAfter).to.equal(playersCount + 1n)
    })

    it('should let the owner start a game', async function () {
      const { contract } = await loadFixture(deploy)
      await createGame(contract, account1)

      // Fast forward to the game start time
      const [, , , , startTime, ,] = await contract.read.games([0n])
      await time.increaseTo(startTime)

      await startGame(contract, account1)
    })

    it('should let the owner settle a game', async function () {
      const { contract } = await loadFixture(deploy)
      await createGame(contract, account1)
      const [, , fee, , startTime, duration] = await contract.read.games([0n])

      // Join the game from account 2
      await contract.write.joinGame([0n], { account: account2, value: fee })

      await time.increaseTo(startTime)
      await startGame(contract, account1)

      await time.increase(duration)
      await settleGame(contract, account1)
    })

    it('should allow the owner to withdraw fees', async function () {
      const { contract } = await loadFixture(deploy)
      await createGame(contract, account1)
      const [, , fee, , startTime, duration] = await contract.read.games([0n])

      // Join the game from account 2
      await contract.write.joinGame([0n], { account: account2, value: fee })

      await time.increaseTo(startTime)
      await startGame(contract, account1)

      await time.increase(duration)
      await settleGame(contract, account1)

      const percentageFee = await contract.read.fee()
      const feeAmount = (fee * percentageFee) / 10000n

      const client = await hre.viem.getPublicClient()
      const contractBalanceBefore = await client.getBalance({
        address: contract.address,
      })

      expect(contractBalanceBefore).to.equal(feeAmount)
      await contract.write.execute([account1, feeAmount, '0x'], {
        account: account1,
      })

      const contractBalanceAfter = await client.getBalance({
        address: contract.address,
      })
      expect(contractBalanceAfter).to.equal(0n)
    })

    it('should let a player submit multiple responses', async function () {
      const { contract } = await loadFixture(deploy)
      await createGame(contract, account1)
      const [, , fee, , startTime, duration] = await contract.read.games([0n])

      // Join the game from account 2
      await contract.write.joinGame([0n], { account: account2, value: fee })

      await time.increaseTo(startTime)
      await startGame(contract, account1)

      // Submit initial responses
      const responses = ['0x1234', '0x5678', '0x9abc'] as const
      await contract.write.submitResponses([0n, responses], {
        account: account2,
      })

      // Submit new responses to replace the previous ones
      const newResponses = ['0x1111', '0x2222', '0x3333'] as const
      await contract.write.submitResponses([0n, newResponses], {
        account: account2,
      })
    })

    it('should let the owner change the fee', async function () {
      const { contract } = await loadFixture(deploy)
      await createGame(contract, account1)
      expect(await contract.read.fee()).to.equal(1000n)
      await contract.write.changeFee([2000n], { account: account1 })
      expect(await contract.read.fee()).to.equal(2000n)
    })
  })

  describe('Negative tests', function () {
    it('should prevent non-owners from creating games', async function () {
      const { contract } = await loadFixture(deploy)
      const nonOwnerCreateCall = createGame(contract, account2)
      await expect(nonOwnerCreateCall).to.be.rejectedWith(
        `OwnableUnauthorizedAccount("${account2}")`
      )
    })

    it('should prevent the owner from starting a game too early', async function () {
      const { contract } = await loadFixture(deploy)
      await createGame(contract, account1)
      await expect(startGame(contract, account1)).to.be.rejectedWith(
        `CannotStartGame()`
      )
    })

    it('should prevent the owner from settling a game too early', async function () {
      const { contract } = await loadFixture(deploy)
      await createGame(contract, account1)
      const [, , fee, , startTime, duration] = await contract.read.games([0n])

      // Have somebody join the game
      await contract.write.joinGame([0n], { account: account2, value: fee })

      await time.increaseTo(startTime)
      await startGame(contract, account1)

      await expect(settleGame(contract, account1)).to.be.rejectedWith(
        `GameNotOver()`
      )
    })

    it('should prevent non-owners from changing the fee', async function () {
      const { contract } = await loadFixture(deploy)
      await createGame(contract, account1)
      await expect(
        contract.write.changeFee([2000n], { account: account2 })
      ).to.be.rejectedWith(`OwnableUnauthorizedAccount("${account2}")`)
    })
  })
})

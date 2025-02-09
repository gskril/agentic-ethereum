// npx hardhat run scripts/start-game.ts --network base
import { GAMESHOW_CONTRACT } from 'agent/src/contract'
import hre from 'hardhat'

async function main() {
  const contract = await hre.viem.getContractAt(
    'GameShow',
    GAMESHOW_CONTRACT.address
  )

  /* 
  uint256 _gameId,
  string[] calldata _questions
  */
  const tx = await contract.write.startGame([0n, ['Is fruit a dessert?']]) // (The answer is no)

  console.log('Game started', tx)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

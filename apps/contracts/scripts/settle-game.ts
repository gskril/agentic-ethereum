// npx hardhat run scripts/settle-game.ts --network baseSepolia
import { GAMESHOW_CONTRACT } from 'agent/src/contract'
import hre from 'hardhat'

async function main() {
  const contract = await hre.viem.getContractAt(
    'GameShow',
    GAMESHOW_CONTRACT.address
  )

  /* 
  uint256 _gameId,
  address _winner
  */
  const tx = await contract.write.settleGame([0n, GAMESHOW_CONTRACT.address])

  console.log('Game settled', tx)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

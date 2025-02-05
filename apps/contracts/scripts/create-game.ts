// npx hardhat run scripts/create-game.ts --network baseSepolia
import { GAMESHOW_CONTRACT } from 'agent/src/contract'
import hre from 'hardhat'

async function main() {
  const contract = await hre.viem.getContractAt(
    'GameShow',
    GAMESHOW_CONTRACT.address
  )

  /* 
  string memory _title,
  uint256 _entryFee,
  uint256 _playersLimit,
  uint256 _expectedStartTime,
  uint256 _duration,
  uint256 _questionsCount
  */
  const tx = await contract.write.createGame([
    'Desserts',
    10000000000000000n,
    3n,
    1738785201n,
    180n,
    3n,
  ])

  console.log('Game started', tx)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

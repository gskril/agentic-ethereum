// npx hardhat run scripts/execute.ts --network base
import { GAMESHOW_CONTRACT } from 'agent/src/contract'
import hre from 'hardhat'

async function main() {
  // const contractAddr = GAMESHOW_CONTRACT.address
  const contractAddr = '0x00000000B5bec517B9641973230B171E3E859662'

  const contract = await hre.viem.getContractAt('GameShow', contractAddr)

  const balance = await (
    await hre.viem.getPublicClient()
  ).getBalance({
    address: contractAddr,
  })

  /* 
  address _to,
  uint256 _value,
  bytes memory _data
  */
  const tx = await contract.write.execute([
    '0x179A862703a4adfb29896552DF9e307980D19285',
    balance,
    '0x',
  ])

  console.log('Transferred ETH', tx)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

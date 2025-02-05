// npx hardhat run scripts/deploy.ts --network baseSepolia
import hre from 'hardhat'
import { encodeAbiParameters } from 'viem/utils'

import { create2Deploy } from './lib/create2'

async function main() {
  const contractName = 'GameShow'

  const constructorArguments = [
    '0x1d750A336B16C3D5FBc0D7024b90EbB20429c463', // _owner
  ] as const

  if (hre.network.name === 'localhost') {
    const deployment = await hre.viem.deployContract(
      // @ts-ignore
      contractName,
      constructorArguments
    )

    console.log(`Deployed ${contractName} to ${deployment.address}`)
    return
  }

  const encodedArgs = encodeAbiParameters(
    [{ type: 'address' }],
    constructorArguments
  )

  const { address } = await create2Deploy({
    encodedArgs,
    contractName,
    // Generate using create2crunch or similar
    salt: '0x000000000000000000000000000000000000000046010f91de6b5e03b5aef40b',
  })

  console.log(`Deployed ${contractName} to ${address}`)

  try {
    // Wait 10 seconds for block explorers to index the deployment
    await new Promise((resolve) => setTimeout(resolve, 10_000))
    await hre.run('verify:verify', { address, constructorArguments })
  } catch (error) {
    console.error(error)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

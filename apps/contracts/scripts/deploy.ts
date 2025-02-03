// pnpm run deploy:local
import hre from 'hardhat'
import { encodeAbiParameters } from 'viem/utils'

import { create2Deploy } from './lib/create2'

async function main() {
  const contractName = 'GameShow'

  const constructorArguments = [
    '0x179A862703a4adfb29896552DF9e307980D19285', // _owner
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
    salt: '0xc670b4d01b86494f31a5eaed0c4423c87de30755fa61604cac330074b7ac87f2',
  })

  console.log(`Deployed ${contractName} to ${address}`)

  try {
    // Wait 30 seconds for block explorers to index the deployment
    await new Promise((resolve) => setTimeout(resolve, 30_000))
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

// pnpm run deploy:local
import hre from 'hardhat'
import { encodeAbiParameters } from 'viem/utils'

import { generateSaltAndDeploy } from './lib/create2'

async function main() {
  const contractName = 'GameShow'

  const constructorArguments = [
    '0x179A862703a4adfb29896552DF9e307980D19285', // _owner
  ] as const

  const encodedArgs = encodeAbiParameters(
    [{ type: 'address' }],
    constructorArguments
  )

  const { address } = await generateSaltAndDeploy({
    vanity: '0x',
    encodedArgs,
    contractName,
    caseSensitive: false,
    startingIteration: 0,
  })

  console.log(`Deployed ${contractName} to ${address}`)

  if (hre.network.name === 'localhost') return

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

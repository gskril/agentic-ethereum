import hre from 'hardhat'
import { Hex, parseAbi } from 'viem'

import { getInitCode } from './initcode'

// https://github.com/pcaversaccio/create2deployer
const create2Factory = {
  address: '0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2',
  abi: parseAbi([
    'event Deployed(address addr)',
    'function deploy(uint256 value, bytes32 salt, bytes memory code) public',
    'function computeAddress(bytes32 salt, bytes32 codeHash) public view returns (address)',
  ]),
} as const

type Props = {
  contractName: string
  encodedArgs: Hex
  salt: Hex
}

export async function create2Deploy({
  contractName,
  encodedArgs,
  salt,
}: Props) {
  const publicClient = await hre.viem.getPublicClient()
  const [walletClient] = await hre.viem.getWalletClients()

  const { initCode } = await getInitCode(contractName, encodedArgs)

  const address = await publicClient.readContract({
    ...create2Factory,
    functionName: 'computeAddress',
    args: [salt, initCode],
  })

  const deployTx = await walletClient.writeContract({
    ...create2Factory,
    functionName: 'deploy',
    args: [0n, salt, initCode],
  })

  await publicClient.waitForTransactionReceipt({ hash: deployTx })

  return { address }
}

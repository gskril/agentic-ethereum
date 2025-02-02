// Fund gregskril.eth on hardhat devnet
// npx hardhat run scripts/fund-eoa.ts --network localhost
import hre from 'hardhat'
import { parseEther, publicActions } from 'viem'

async function main() {
  // Client of default hardhat account
  const hardhatAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  const eoaAddress = '0x179A862703a4adfb29896552DF9e307980D19285'

  const walletClient = await hre.viem.getWalletClient(hardhatAddress)

  await walletClient.sendTransaction({
    to: eoaAddress,
    value: parseEther('1'),
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

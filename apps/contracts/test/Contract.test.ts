import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'

// Hardhat accounts
const account1 = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

const deploy = async () => {
  const contract = await hre.viem.deployContract('GameShow', [
    account1, // _owner
  ])

  return { contract }
}

describe('Tests', function () {
  it('should return the contract name', async function () {
    const { contract } = await loadFixture(deploy)

    const contractName = await contract.read.name()
    expect(contractName).to.equal('Game Show')
  })
})

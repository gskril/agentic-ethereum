// Note: this file doesn't actually do anything yet, I just copied the code from their docs
// The idea is to use Lit for Agent Wallet and time-based decryption rules
// https://developer.litprotocol.com/sdk/access-control/evm/timelock
// https://developer.litprotocol.com/agent-wallet/intro
import { LIT_NETWORK } from '@lit-protocol/constants'
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs'

async function getLitNodeClient(): Promise<LitJsSdk.LitNodeClientNodeJs> {
  const litNodeClientInstance = new LitJsSdk.LitNodeClientNodeJs({
    alertWhenUnauthorized: false,
    litNetwork: LIT_NETWORK.DatilDev, // DatilDev network for free usage
    debug: false,
  })

  await litNodeClientInstance.connect()
  return litNodeClientInstance
}

const litNodeClient = await getLitNodeClient()

// Allow users to decrypt after a block timestamp
function getAccessControlConditions(): object[] {
  return [
    {
      contractAddress: '',
      standardContractType: 'timestamp',
      chain: 'base',
      method: 'eth_getBlockByNumber',
      parameters: ['latest'],
      returnValueTest: {
        comparator: '>=',
        value: '1651276942',
      },
    },
  ]
}

import { EvmWalletProvider } from '@coinbase/agentkit'
import { TransactionReceipt } from 'viem'

// TODO: Figure out if it's feasible to add support for Lit's Agent Wallet to AgentKit
// https://developer.litprotocol.com/agent-wallet/intro
export class LitAgentWalletProvider extends EvmWalletProvider {
  async sendTransaction(transaction: any): Promise<`0x${string}`> {
    return '0x'
  }

  async waitForTransactionReceipt(txHash: `0x${string}`): Promise<any> {
    return null
  }

  async readContract(params: any): Promise<any> {
    return null
  }

  //////////////////////////////////////////////////////////////
  //////////// Ignore the following methods for now ////////////
  //////////////////////////////////////////////////////////////

  async signMessage(message: string | Uint8Array): Promise<`0x${string}`> {
    return '0x'
  }

  async signTypedData(typedData: any): Promise<`0x${string}`> {
    return '0x'
  }

  async signTransaction(transaction: any): Promise<`0x${string}`> {
    return '0x'
  }

  getAddress(): string {
    return '0x'
  }

  getNetwork(): any {
    return '0x'
  }

  getName(): string {
    return '0x'
  }

  async getBalance(): Promise<bigint> {
    return BigInt(0)
  }

  async nativeTransfer(
    to: `0x${string}`,
    value: string
  ): Promise<`0x${string}`> {
    return '0x'
  }
}

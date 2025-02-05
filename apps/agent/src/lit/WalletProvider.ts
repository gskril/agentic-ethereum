import { EvmWalletProvider } from '@coinbase/agentkit'

// TODO: Figure out if it's feasible to add support for Lit's Agent Wallet to AgentKit
// https://developer.litprotocol.com/agent-wallet/intro
export class LitAgentWalletProvider extends EvmWalletProvider {
  async sendTransaction(transaction: any): Promise<`0x${string}`> {
    throw new Error('Method not implemented.')
  }

  async waitForTransactionReceipt(txHash: `0x${string}`): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async readContract(params: any): Promise<any> {
    throw new Error('Method not implemented.')
  }

  //////////////////////////////////////////////////////////////
  //////////// Ignore the following methods for now ////////////
  //////////////////////////////////////////////////////////////

  async signMessage(message: string | Uint8Array): Promise<`0x${string}`> {
    throw new Error('Method not implemented.')
  }

  async signTypedData(typedData: any): Promise<`0x${string}`> {
    throw new Error('Method not implemented.')
  }

  async signTransaction(transaction: any): Promise<`0x${string}`> {
    throw new Error('Method not implemented.')
  }

  getAddress(): string {
    throw new Error('Method not implemented.')
  }

  getNetwork(): any {
    throw new Error('Method not implemented.')
  }

  getName(): string {
    throw new Error('Method not implemented.')
  }

  async getBalance(): Promise<bigint> {
    throw new Error('Method not implemented.')
  }

  async nativeTransfer(
    to: `0x${string}`,
    value: string
  ): Promise<`0x${string}`> {
    throw new Error('Method not implemented.')
  }
}

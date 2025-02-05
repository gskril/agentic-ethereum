import { ViemWalletProvider } from '@coinbase/agentkit'
import {
  PublicClient,
  SimulateContractParameters,
  SimulateContractReturnType,
  WalletClient,
  publicActions,
} from 'viem'

// TODO: Figure out if it's feasible to add support for Lit's Agent Wallet to AgentKit
// https://developer.litprotocol.com/agent-wallet/intro
export class LitAgentWalletProvider extends ViemWalletProvider {
  #publicClient: PublicClient

  constructor(walletClient: WalletClient) {
    super(walletClient)
    this.#publicClient = walletClient.extend(publicActions) as PublicClient
  }

  async simulateContract(
    params: SimulateContractParameters
  ): Promise<SimulateContractReturnType> {
    return this.#publicClient.simulateContract(params)
  }
}

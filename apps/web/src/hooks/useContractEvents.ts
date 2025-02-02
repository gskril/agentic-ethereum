import { useQuery } from '@tanstack/react-query'
import { GAMESHOW_CONTRACT } from 'contracts/deployments'
import { decodeEventLog } from 'viem'
import { usePublicClient } from 'wagmi'

import { chains, wagmiConfig } from '@/lib/web3'

type Props = {
  queryKey?: string
  refetchInterval?: number | false
}

export function useContractEvents({
  queryKey,
  refetchInterval = false,
}: Props = {}) {
  const viemClient = usePublicClient({
    config: wagmiConfig,
    chainId: chains[0].id,
  })

  return useQuery({
    refetchInterval,
    queryKey: ['events', queryKey],
    queryFn: async () => {
      const logs = await viemClient.getLogs({
        address: GAMESHOW_CONTRACT.address,
        fromBlock: BigInt(0),
      })

      const decodedLogs = logs.map((log) =>
        decodeEventLog({
          abi: GAMESHOW_CONTRACT.abi,
          data: log.data,
          topics: log.topics,
        })
      )

      console.log(GAMESHOW_CONTRACT.address)

      const formattedLogs = decodedLogs.map((log) => {
        const { eventName, args } = log

        // If there is a bigint in the args, convert it to a string
        const formattedArgs = Object.fromEntries(
          Object.entries(args || {}).map(([key, value]) => [
            key,
            typeof value === 'bigint' ? value.toString() : value,
          ])
        )

        return { eventName, args: formattedArgs }
      })

      return formattedLogs.reverse()
    },
  })
}

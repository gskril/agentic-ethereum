import { QueryKey, useQuery } from '@tanstack/react-query'
import { GAMESHOW_CONTRACT } from 'contracts/deployments'
import { decodeEventLog } from 'viem'
import { usePublicClient } from 'wagmi'

import { chains, wagmiConfig } from '@/lib/web3'

const eventAbiItems = GAMESHOW_CONTRACT.abi.filter(
  (item) => item.type === 'event'
)

type Props = {
  queryKey?: unknown | unknown[]
  refetchInterval?: number | false
  eventName?: (typeof eventAbiItems)[number]['name']
}

export function useContractEvents({
  queryKey,
  refetchInterval = false,
  eventName,
}: Props = {}) {
  const viemClient = usePublicClient({
    config: wagmiConfig,
    chainId: chains[0].id,
  })

  const queryKeyArray = Array.isArray(queryKey)
    ? queryKey.map((key) => key.toString())
    : [queryKey?.toString()]

  return useQuery({
    refetchInterval,
    queryKey: ['events', ...queryKeyArray],
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

      const filteredLogs = eventName
        ? formattedLogs.filter((log) => log.eventName === eventName)
        : formattedLogs

      return filteredLogs.reverse()
    },
  })
}

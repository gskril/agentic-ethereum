import { useQuery } from '@tanstack/react-query'
import { GAMESHOW_CONTRACT } from 'agent/src/contract'
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

// TODO: Refine the return type based on the `eventName`
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
      const logs = await viemClient.getLogs(GAMESHOW_CONTRACT)

      const decodedLogs = logs.map((log) =>
        decodeEventLog({
          abi: GAMESHOW_CONTRACT.abi,
          data: log.data,
          topics: log.topics,
        })
      )

      const filteredLogs = eventName
        ? decodedLogs.filter((log) => log.eventName === eventName)
        : decodedLogs

      return filteredLogs.reverse()
    },
  })
}

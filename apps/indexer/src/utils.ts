export function translateState({
  state,
  blockTimestamp,
  startTime,
  duration,
}: {
  state: number
  blockTimestamp: bigint
  startTime: bigint
  duration: bigint
}) {
  switch (state) {
    case 0:
      return 'empty'
    case 1:
      if (blockTimestamp > startTime) {
        return 'waiting-start'
      }

      return 'open'
    case 2:
      if (blockTimestamp > startTime + duration) {
        return 'waiting-settle'
      }

      return 'active'
    default:
      return 'settled'
  }
}

'use client'

import frameSDK, { type Context } from '@farcaster/frame-sdk'
import { createContext, useContext, useEffect, useState } from 'react'

type FrameContext = Context.FrameContext

interface FrameContextValue {
  context: FrameContext | undefined
  isLoaded: boolean
}

export const FrameSDKContext = createContext<FrameContextValue>({
  context: undefined,
  isLoaded: false,
})

export function FrameSDKProvider({ children }: { children: React.ReactNode }) {
  const [isFrameSDKLoaded, setIsFrameSDKLoaded] = useState(false)
  const [context, setContext] = useState<FrameContext>()

  useEffect(() => {
    const load = async () => {
      setContext(await frameSDK.context)
      frameSDK.actions.ready({})
    }
    if (frameSDK && !isFrameSDKLoaded) {
      setIsFrameSDKLoaded(true)
      load()
    }
  }, [isFrameSDKLoaded])

  return (
    <FrameSDKContext.Provider
      value={{
        context,
        isLoaded: isFrameSDKLoaded,
      }}
    >
      {children}
    </FrameSDKContext.Provider>
  )
}

export function useFrame() {
  const { context } = useContext(FrameSDKContext)
  const actions = frameSDK.actions

  return { context, actions }
}

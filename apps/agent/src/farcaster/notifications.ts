// Identical to the web/src/lib/notifications.ts file
import { SendNotificationRequest } from '@farcaster/frame-sdk'
import crypto from 'node:crypto'

import { getUserNotificationDetails } from './kv.js'

const appUrl = new URL(process.env.WEB_URL || '').toString()

type SendFrameNotificationResult =
  | {
      state: 'error'
      error: unknown
    }
  | { state: 'no_token' }
  | { state: 'rate_limit' }
  | { state: 'success' }

export async function sendFrameNotification({
  fid,
  title,
  body,
}: {
  fid: number
  title: string
  body: string
}): Promise<SendFrameNotificationResult> {
  const notificationDetails = await getUserNotificationDetails(fid)
  if (!notificationDetails) {
    return { state: 'no_token' }
  }

  const response = await fetch(notificationDetails.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      notificationId: crypto.randomUUID(),
      title,
      body,
      targetUrl: appUrl,
      tokens: [notificationDetails.token],
    } satisfies SendNotificationRequest),
  })

  const responseJson = await response.json()

  if (response.status === 200) {
    if (responseJson.success === false) {
      // Malformed response
      return { state: 'error', error: responseJson.error.errors }
    }

    if (responseJson.data.result.rateLimitedTokens.length) {
      // Rate limited
      return { state: 'rate_limit' }
    }

    return { state: 'success' }
  } else {
    // Error response
    return { state: 'error', error: responseJson }
  }
}

export async function deleteUserNotificationDetails() {}

export async function setUserNotificationDetails() {}

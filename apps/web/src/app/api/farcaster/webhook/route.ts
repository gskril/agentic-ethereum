import {
  ParseWebhookEvent,
  createVerifyAppKeyWithHub,
  parseWebhookEvent,
} from '@farcaster/frame-node'
import { NextRequest } from 'next/server'

import {
  deleteUserNotificationDetails,
  setUserNotificationDetails,
} from '@/lib/kv'
import { sendFrameNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  const requestJson = await request.json()
  const verifier = createVerifyAppKeyWithHub('https://hoyt.farcaster.xyz:2281')

  let data
  try {
    data = await parseWebhookEvent(requestJson, verifier)
  } catch (e: unknown) {
    const error = e as ParseWebhookEvent.ErrorType

    switch (error.name) {
      case 'VerifyJsonFarcasterSignature.InvalidDataError':
      case 'VerifyJsonFarcasterSignature.InvalidEventDataError':
        // The request data is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      case 'VerifyJsonFarcasterSignature.InvalidAppKeyError':
        // The app key is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 401 }
        )
      case 'VerifyJsonFarcasterSignature.VerifyAppKeyError':
        // Internal error verifying the app key (caller may want to try again)
        console.error(error)
        return Response.json(
          { success: false, error: error.message },
          { status: 500 }
        )
    }
  }

  const fid = data.fid
  const event = data.event

  switch (event.event) {
    case 'frame_added':
      if (event.notificationDetails) {
        await setUserNotificationDetails(fid, event.notificationDetails)
      } else {
        await deleteUserNotificationDetails(fid)
      }
    case 'frame_removed':
      await deleteUserNotificationDetails(fid)

      break
    case 'notifications_enabled':
      await setUserNotificationDetails(fid, event.notificationDetails)
      await sendFrameNotification({
        fid,
        title: 'Onchain Trivia',
        body: "You'll be notified about games you've joined.",
      })

      break
    case 'notifications_disabled':
      await deleteUserNotificationDetails(fid)

      break
  }

  return Response.json({ success: true })
}

import type { Resend } from 'resend'

import { getResendClient } from './resendClient.js'

interface FeedbackEmailPayload {
  userId: string
  userEmail?: string | null
  message: string
  timestamp: string
}

export const sendFeedbackEmail = async ({ userId, userEmail, message, timestamp }: FeedbackEmailPayload): Promise<void> => {
  const to = process.env.ADMIN_EMAIL
  const from = process.env.FEEDBACK_FROM_EMAIL || to

  if (!to || !from) {
    throw new Error('ADMIN_EMAIL or FEEDBACK_FROM_EMAIL not configured')
  }

  const resend: Resend = getResendClient()

  await resend.emails.send({
    from,
    to,
    subject: `New Feedback from ${userEmail ?? 'unknown user'}`,
    text: [
      `New feedback submission received at ${timestamp}.`,
      '',
      `User ID: ${userId}`,
      `User Email: ${userEmail ?? 'N/A'}`,
      '',
      'Message:',
      message,
    ].join('\n'),
  })
}

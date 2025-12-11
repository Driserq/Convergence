import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { requireUser } from '../lib/auth/requireUser.js'
import { checkRateLimit } from '../lib/rateLimiter.js'
import { sendFeedbackEmail } from '../lib/email/sendFeedbackEmail.js'

const feedbackSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(500, 'Message must be 500 characters or less')
})

type AuthenticatedRequest = FastifyRequest & { user?: { id: string; email?: string | null } }

const LIMIT_MESSAGE = 'You reached the daily feedback limit. Please try again tomorrow.'
const FRIENDLY_FAILURE = 'Uh-oh, something went down. Could you save this and try again or email me directly at kuba@consum.app'

export default async function feedbackRoutes(fastify: FastifyInstance) {
  fastify.post('/api/feedback', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    let user: { id: string; email?: string | null } | null = null

    try {
      user = await requireUser(request, reply)
    } catch (error) {
      console.error('[Feedback] Auth resolve failed:', error)
      return reply.code(500).send({ success: false, error: FRIENDLY_FAILURE })
    }

    if (!user) return

    const validation = feedbackSchema.safeParse(request.body)
    if (!validation.success) {
      return reply
        .code(400)
        .send({ success: false, error: validation.error.issues[0]?.message ?? 'Invalid payload' })
    }

    let rateLimit: ReturnType<typeof checkRateLimit>
    try {
      rateLimit = checkRateLimit(user.id)
    } catch (error) {
      console.error('[Feedback] Rate limit check failed:', error)
      return reply.code(500).send({ success: false, error: FRIENDLY_FAILURE })
    }
    if (!rateLimit.allowed) {
      return reply.code(429).send({ success: false, error: LIMIT_MESSAGE, remaining: 0 })
    }

    const timestamp = new Date().toISOString()

    try {
      await sendFeedbackEmail({
        userId: user.id,
        userEmail: user.email,
        message: validation.data.message,
        timestamp,
      })

      return reply.send({ success: true, remaining: rateLimit.remaining })
    } catch (error) {
      console.error('[Feedback] Email send failed:', error)
      return reply.code(500).send({ success: false, error: FRIENDLY_FAILURE, remaining: rateLimit.remaining })
    }
  })
}

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { supabase } from '../lib/supabase.server.js'
import {
  changeUserPlan,
  getSubscriptionSummary,
  SubscriptionError
} from '../lib/subscriptions/service.js'
import { getServiceClient } from '../lib/database.js'
import type { PlanCode } from '../types/subscription.js'

type AuthenticatedRequest = FastifyRequest & { user?: { id: string; email?: string | null } }

const planCodes: readonly PlanCode[] = ['free', 'weekly', 'monthly']

const changePlanSchema = z.object({
  planCode: z.enum(planCodes as [PlanCode, ...PlanCode[]])
})

async function requireUser(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ success: false, error: 'Authentication required. Please log in.' })
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    reply.code(401).send({ success: false, error: 'Invalid or expired session. Please log in again.' })
    return null
  }

  return data.user
}

export default async function subscriptionRoutes(fastify: FastifyInstance) {
  fastify.get('/api/subscription', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = await requireUser(request, reply)
    if (!user) return

    try {
      const { summary } = await getSubscriptionSummary(user.id)

      return reply.send({
        success: true,
        subscription: summary
      })
    } catch (error) {
      if (error instanceof SubscriptionError) {
        console.error('[Subscription] Failed to load summary:', error)
        return reply.code(500).send({ success: false, error: error.message })
      }

      console.error('[Subscription] Unexpected error:', error)
      return reply.code(500).send({ success: false, error: 'Failed to load subscription information' })
    }
  })

  fastify.post('/api/subscription/plan', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = await requireUser(request, reply)
    if (!user) return

    const validation = changePlanSchema.safeParse(request.body)
    if (!validation.success) {
      return reply.code(400).send({ success: false, error: validation.error.issues[0]?.message ?? 'Invalid payload' })
    }

    try {
      const { summary } = await changeUserPlan(user.id, validation.data.planCode)

      return reply.send({
        success: true,
        subscription: summary
      })
    } catch (error) {
      if (error instanceof SubscriptionError) {
        console.error('[Subscription] Failed to change plan:', error)
        return reply.code(500).send({ success: false, error: error.message })
      }

      console.error('[Subscription] Unexpected error changing plan:', error)
      return reply.code(500).send({ success: false, error: 'Failed to update subscription plan' })
    }
  })

  fastify.delete('/api/user', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = await requireUser(request, reply)
    if (!user) return

    try {
      const client = getServiceClient()
      
      // Delete the user using the service role client (admin privilege)
      const { error } = await client.auth.admin.deleteUser(user.id)

      if (error) {
        throw error
      }

      return reply.send({ success: true })
    } catch (error: any) {
      console.error('[User] Failed to delete user:', error)
      return reply.code(500).send({ success: false, error: error.message || 'Failed to delete account' })
    }
  })
}

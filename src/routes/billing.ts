import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { supabase } from '../lib/supabase.server.js'
import { stripe, getPriceIdForPlan } from '../lib/stripe.js'
import { getServiceClient } from '../lib/database.js'
import type { PlanCode } from '../types/subscription.js'

type AuthenticatedRequest = FastifyRequest & { user?: { id: string; email?: string | null } }

const createCheckoutSchema = z.object({
  planCode: z.enum(['weekly', 'monthly'])
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

export default async function billingRoutes(fastify: FastifyInstance) {
  fastify.post('/api/billing/create-checkout-session', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = await requireUser(request, reply)
    if (!user) return

    const validation = createCheckoutSchema.safeParse(request.body)
    if (!validation.success) {
      return reply.code(400).send({ success: false, error: validation.error.issues[0]?.message ?? 'Invalid payload' })
    }

    const { planCode } = validation.data
    const priceId = getPriceIdForPlan(planCode as PlanCode)

    console.log(`[Billing] Creating checkout session. Plan: ${planCode}, PriceID: ${priceId}`)

    if (!priceId) {
      return reply.code(400).send({ success: false, error: 'Invalid plan selected' })
    }

    try {
      const client = getServiceClient()
      
      // Get current subscription to check for existing customer ID
      const { data: subscription } = await client
        .from('user_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()

      let customerId = subscription?.stripe_customer_id

      // Create Stripe Customer if not exists
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email ?? undefined,
          metadata: {
            app_user_id: user.id
          }
        })
        customerId = customer.id

        await client
          .from('user_subscriptions')
          .upsert({ user_id: user.id, stripe_customer_id: customerId }, { onConflict: 'user_id' })
      }

      const frontendUrl = process.env.FRONTEND_URL || request.headers.origin || 'http://localhost:5173'

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/billing/cancel`,
        metadata: {
          app_user_id: user.id,
          plan_code: planCode
        },
        client_reference_id: user.id
      })

      return reply.send({
        success: true,
        url: session.url,
        sessionId: session.id
      })

    } catch (error: any) {
      console.error('[Billing] Failed to create checkout session:', error)
      return reply.code(500).send({ success: false, error: error.message || 'Failed to create checkout session' })
    }
  })
}

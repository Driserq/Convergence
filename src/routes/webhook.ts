import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import Stripe from 'stripe'
import { stripe, getPlanCodeForPriceId } from '../lib/stripe.js'
import { getServiceClient } from '../lib/database.js'

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

export default async function webhookRoutes(fastify: FastifyInstance) {
  // Register raw body parsing specifically for this route if not global
  // But fastify-raw-body is usually registered globally or as a plugin. 
  // We will assume it's registered in server.ts for correct content-type.

  fastify.post('/api/stripe/webhook', {
    config: {
      rawBody: true // trigger fastify-raw-body
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const sig = request.headers['stripe-signature']
    
    if (!STRIPE_WEBHOOK_SECRET || !sig) {
      console.error('[Webhook] Missing secret or signature')
      return reply.code(400).send({ error: 'Webhook Error' })
    }

    let event: Stripe.Event

    try {
      // request.rawBody is provided by fastify-raw-body
      const rawBody = (request as any).rawBody
      if (!rawBody) {
         console.error('[Webhook] Missing raw body')
         return reply.code(400).send({ error: 'Raw body missing' })
      }
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
    } catch (err: any) {
      console.error(`[Webhook] Signature verification failed: ${err.message}`)
      return reply.code(400).send({ error: `Webhook Error: ${err.message}` })
    }

    const client = getServiceClient()

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session
          if (session.mode === 'subscription') {
             await handleCheckoutCompleted(session, client)
          }
          break
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription
          await handleSubscriptionUpdated(subscription, client)
          break
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          await handleSubscriptionDeleted(subscription, client)
          break
        }
        default:
          // console.log(`[Webhook] Unhandled event type ${event.type}`)
          break
      }
    } catch (error: any) {
      console.error(`[Webhook] Error processing event ${event.type}:`, error)
      return reply.code(500).send({ error: 'Internal Server Error' })
    }

    return reply.send({ received: true })
  })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, client: any) {
  const userId = session.client_reference_id || session.metadata?.app_user_id
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!userId) {
    console.error('[Webhook] Missing user ID in session')
    return
  }

  // Fetch full subscription details to get periods and items
  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any
  const priceId = subscription.items.data[0].price.id
  const planCode = getPlanCodeForPriceId(priceId)

  console.log(`[Webhook] Checkout completed. Subscription: ${subscriptionId}, PriceID: ${priceId}, Mapped Plan: ${planCode}`)
  console.log(`[Webhook] Period: ${subscription.current_period_start} - ${subscription.current_period_end}`)

  if (!planCode) {
    console.error('[Webhook] Unknown price ID:', priceId)
    return
  }

  const periodStart = typeof subscription.current_period_start === 'number' 
    ? new Date(subscription.current_period_start * 1000).toISOString() 
    : new Date().toISOString()

  const periodEnd = typeof subscription.current_period_end === 'number'
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  await client.from('user_subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    plan_code: planCode,
    is_active: subscription.status === 'active' || subscription.status === 'trialing',
    period_start: periodStart,
    period_end: periodEnd
  }, { onConflict: 'user_id' })

  console.log(`[Webhook] Subscription created for user ${userId} (Plan: ${planCode})`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, client: any) {
  const sub = subscription as any
  const priceId = sub.items.data[0]?.price?.id
  const planCode = priceId ? getPlanCodeForPriceId(priceId) : null
  
  console.log(`[Webhook] Subscription updated. ID: ${sub.id}, PriceID: ${priceId}, Mapped Plan: ${planCode}`)
  
  const subscriptionId = sub.id

  if (!planCode) {
    console.log('[Webhook] Subscription updated but unknown plan/price, skipping update.')
    return
  }

  const isActive = sub.status === 'active' || sub.status === 'trialing'

  const periodStart = typeof sub.current_period_start === 'number' 
    ? new Date(sub.current_period_start * 1000).toISOString() 
    : new Date().toISOString()

  const periodEnd = typeof sub.current_period_end === 'number'
    ? new Date(sub.current_period_end * 1000).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: targetUser, error: lookupError } = await client
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle()

  if (lookupError) {
    console.error('[Webhook] Failed to find subscription owner:', lookupError)
    return
  }

  if (!targetUser) {
    console.warn('[Webhook] Subscription update received without matching user. Skipping.')
    return
  }

  const { error } = await client.from('user_subscriptions').update({
    plan_code: planCode,
    is_active: isActive,
    period_start: periodStart,
    period_end: periodEnd
  }).eq('user_id', targetUser.user_id)

  if (error) {
     console.error('[Webhook] Failed to update subscription:', error)
  } else {
     console.log(`[Webhook] Subscription ${subscriptionId} updated for user ${targetUser.user_id}.`)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, client: any) {
  const subscriptionId = subscription.id

  const { data: targetUser, error: lookupError } = await client
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle()

  if (lookupError) {
    console.error('[Webhook] Failed to resolve user for deletion:', lookupError)
    return
  }

  if (!targetUser) {
    console.warn('[Webhook] Subscription deletion with no matching user. Skipping downgrade.')
    return
  }

  const { error } = await client.from('user_subscriptions').update({
    plan_code: 'free',
    is_active: true,
    stripe_subscription_id: null,
    period_start: new Date().toISOString(),
    period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }).eq('user_id', targetUser.user_id)

  if (error) {
    console.error('[Webhook] Failed to process subscription deletion:', error)
  } else {
    console.log(`[Webhook] Subscription ${subscriptionId} deleted. User ${targetUser.user_id} downgraded to free.`)
  }
}

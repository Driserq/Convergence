import { getPlan, getDefaultPlan } from './plans.js'
import { getServiceClient } from '../database.js'
import type {
  PlanCode,
  SubscriptionRecord,
  SubscriptionUsage,
  SubscriptionSummary
} from '../../types/subscription.js'

export class SubscriptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SubscriptionError'
  }
}

export class InactiveSubscriptionError extends SubscriptionError {
  public readonly planCode: PlanCode

  constructor(planCode: PlanCode) {
    super('Subscription is inactive')
    this.planCode = planCode
    this.name = 'InactiveSubscriptionError'
  }
}

export interface QuotaExceededDetails extends SubscriptionUsage {}

export class QuotaExceededError extends SubscriptionError {
  public readonly details: QuotaExceededDetails

  constructor(details: QuotaExceededDetails) {
    super('Subscription quota exceeded')
    this.details = details
    this.name = 'QuotaExceededError'
  }
}

const buildPeriodWindow = (planCode: PlanCode, reference: Date = new Date()) => {
  const plan = getPlan(planCode)
  const start = new Date(reference)
  const end = new Date(start)

  if (plan.periodType === 'week') {
    end.setDate(end.getDate() + 7)
  } else {
    end.setMonth(end.getMonth() + 1)
  }

  return { start, end }
}

const FIVE_MINUTES_MS = 5 * 60 * 1000

const shouldResetWindow = (planCode: PlanCode, periodStart: Date, periodEnd: Date, now: Date): boolean => {
  if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) {
    return true
  }

  if (periodEnd <= periodStart) {
    return true
  }

  if (periodEnd <= now) {
    return true
  }

  const expectedWindow = buildPeriodWindow(planCode, periodStart)
  const expectedDuration = expectedWindow.end.getTime() - expectedWindow.start.getTime()
  const actualDuration = periodEnd.getTime() - periodStart.getTime()

  if (actualDuration > expectedDuration + FIVE_MINUTES_MS) {
    return true
  }

  return false
}

const normalizeSubscription = (row: any): SubscriptionRecord => ({
  id: row.id,
  user_id: row.user_id,
  plan_code: row.plan_code,
  is_active: row.is_active,
  period_start: row.period_start,
  period_end: row.period_end,
  created_at: row.created_at,
  updated_at: row.updated_at
})

export const getOrCreateSubscription = async (userId: string): Promise<SubscriptionRecord> => {
  const client = getServiceClient()

  const { data, error } = await client
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new SubscriptionError(error.message)
  }

  if (data) {
    return normalizeSubscription(data)
  }

  const defaultPlan = getDefaultPlan()
  const { start, end } = buildPeriodWindow(defaultPlan.code)

  const { data: inserted, error: insertError } = await client
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      plan_code: defaultPlan.code,
      is_active: true,
      period_start: start.toISOString(),
      period_end: end.toISOString()
    })
    .select('*')
    .single()

  if (insertError) {
    throw new SubscriptionError(insertError.message)
  }

  return normalizeSubscription(inserted)
}

export const ensureCurrentPeriod = async (subscription: SubscriptionRecord): Promise<SubscriptionRecord> => {
  const now = new Date()
  const periodStart = new Date(subscription.period_start)
  const periodEnd = new Date(subscription.period_end)

  if (!shouldResetWindow(subscription.plan_code, periodStart, periodEnd, now)) {
    return subscription
  }

  const reference = periodStart > now ? periodStart : now
  const { start, end } = buildPeriodWindow(subscription.plan_code, reference)
  const client = getServiceClient()

  const { data, error } = await client
    .from('user_subscriptions')
    .update({
      period_start: start.toISOString(),
      period_end: end.toISOString()
    })
    .eq('id', subscription.id)
    .select('*')
    .single()

  if (error) {
    throw new SubscriptionError(error.message)
  }

  return normalizeSubscription(data)
}

export const computeUsage = async (subscription: SubscriptionRecord): Promise<SubscriptionUsage> => {
  const client = getServiceClient()
  const plan = getPlan(subscription.plan_code)

  const { count, error } = await client
    .from('habit_blueprints')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', subscription.user_id)
    .gte('created_at', subscription.period_start)
    .lt('created_at', subscription.period_end)

  if (error) {
    throw new SubscriptionError(error.message)
  }

  const used = count ?? 0
  const remaining = Math.max(0, plan.limit - used)

  return {
    planCode: plan.code,
    planName: plan.name,
    limit: plan.limit,
    used,
    remaining,
    periodStart: subscription.period_start,
    periodEnd: subscription.period_end
  }
}

export const assertActive = (subscription: SubscriptionRecord): void => {
  if (!subscription.is_active) {
    throw new InactiveSubscriptionError(subscription.plan_code)
  }
}

export const requireQuota = async (subscription: SubscriptionRecord): Promise<SubscriptionUsage> => {
  const usage = await computeUsage(subscription)

  if (usage.used >= usage.limit) {
    throw new QuotaExceededError(usage)
  }

  return usage
}

export const getSubscriptionSummary = async (userId: string): Promise<{ subscription: SubscriptionRecord; summary: SubscriptionSummary; usage: SubscriptionUsage }> => {
  let subscription = await getOrCreateSubscription(userId)
  subscription = await ensureCurrentPeriod(subscription)

  const usage = await computeUsage(subscription)
  const plan = getPlan(subscription.plan_code)

  return {
    subscription,
    usage,
    summary: {
      planCode: plan.code,
      planName: plan.name,
      isActive: subscription.is_active,
      periodStart: subscription.period_start,
      periodEnd: subscription.period_end,
      usage: {
        limit: usage.limit,
        used: usage.used,
        remaining: usage.remaining
      }
    }
  }
}

export const changeUserPlan = async (userId: string, nextPlanCode: PlanCode): Promise<{ subscription: SubscriptionRecord; summary: SubscriptionSummary; usage: SubscriptionUsage }> => {
  const plan = getPlan(nextPlanCode)
  const now = new Date()
  const { start, end } = buildPeriodWindow(plan.code, now)
  const client = getServiceClient()

  const { data, error } = await client
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan_code: plan.code,
      is_active: true,
      period_start: start.toISOString(),
      period_end: end.toISOString()
    }, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) {
    throw new SubscriptionError(error.message)
  }

  const subscription = normalizeSubscription(data)
  const usage = await computeUsage(subscription)

  return {
    subscription,
    usage,
    summary: {
      planCode: plan.code,
      planName: plan.name,
      isActive: subscription.is_active,
      periodStart: subscription.period_start,
      periodEnd: subscription.period_end,
      usage: {
        limit: usage.limit,
        used: usage.used,
        remaining: usage.remaining
      }
    }
  }
}

export const buildUsageAfterIncrement = (usage: SubscriptionUsage, increment = 1): SubscriptionUsage => {
  const used = usage.used + increment
  const remaining = Math.max(0, usage.limit - used)

  return {
    ...usage,
    used,
    remaining
  }
}

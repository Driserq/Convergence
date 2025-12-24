import type { PlanCode, PlanDefinition } from '../../types/subscription.js'

export const PLAN_CONFIG: Record<PlanCode, PlanDefinition> = {
  free: {
    code: 'free',
    name: 'Free',
    limit: 5,
    periodType: 'month',
    habitTrackingQuota: 5,
    actionTrackingQuota: 7
  },
  weekly: {
    code: 'weekly',
    name: 'Weekly',
    limit: 15,
    periodType: 'week',
    habitTrackingQuota: 5,
    actionTrackingQuota: 7
  },
  monthly: {
    code: 'monthly',
    name: 'Monthly',
    limit: 60,
    periodType: 'month',
    habitTrackingQuota: 5,
    actionTrackingQuota: 7
  },
  test: {
    code: 'test',
    name: 'Test',
    limit: 111,
    periodType: 'month',
    habitTrackingQuota: 30,
    actionTrackingQuota: 30
  }
}

export const getPlan = (code: PlanCode): PlanDefinition => {
  const plan = PLAN_CONFIG[code]
  if (!plan) {
    throw new Error(`Unknown plan code: ${code}`)
  }
  return plan
}

export const getDefaultPlan = (): PlanDefinition => PLAN_CONFIG.free

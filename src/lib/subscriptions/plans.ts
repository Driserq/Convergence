import type { PlanCode, PlanDefinition } from '../../types/subscription.js'

export const PLAN_CONFIG: Record<PlanCode, PlanDefinition> = {
  free: {
    code: 'free',
    name: 'Free',
    limit: 5,
    periodType: 'month'
  },
  weekly: {
    code: 'weekly',
    name: 'Weekly',
    limit: 15,
    periodType: 'week'
  },
  monthly: {
    code: 'monthly',
    name: 'Monthly',
    limit: 60,
    periodType: 'month'
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

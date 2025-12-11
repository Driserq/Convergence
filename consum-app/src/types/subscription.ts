export type PlanCode = 'free' | 'weekly' | 'monthly'

export interface PlanDefinition {
  code: PlanCode
  name: string
  limit: number
  periodType: 'week' | 'month'
}

export interface SubscriptionRecord {
  id: string
  user_id: string
  plan_code: PlanCode
  is_active: boolean
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface SubscriptionUsage {
  planCode: PlanCode
  planName: string
  limit: number
  used: number
  remaining: number
  periodStart: string
  periodEnd: string
}

export interface SubscriptionSummary {
  planCode: PlanCode
  planName: string
  isActive: boolean
  periodStart: string
  periodEnd: string
  usage: {
    limit: number
    used: number
    remaining: number
  }
}

export interface QuotaExceededPayload {
  code: 'quota_exceeded'
  message: string
  subscription: SubscriptionSummary
}

export interface SubscriptionResponse {
  success: boolean
  subscription?: SubscriptionSummary
  error?: string
}

export interface ChangePlanRequest {
  planCode: PlanCode
}

export interface ChangePlanResponse {
  success: boolean
  subscription?: SubscriptionSummary
  error?: string
}

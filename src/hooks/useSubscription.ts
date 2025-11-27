import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type {
  ChangePlanResponse,
  PlanCode,
  SubscriptionResponse,
  SubscriptionSummary
} from '../types/subscription'

const SUBSCRIPTION_CACHE_KEY = 'convergence.subscription.cache'
const SUBSCRIPTION_CACHE_TTL_MS = 5 * 60 * 1000

const readCache = (): SubscriptionSummary | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SUBSCRIPTION_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { timestamp: number; data: SubscriptionSummary }
    if (Date.now() - parsed.timestamp > SUBSCRIPTION_CACHE_TTL_MS) {
      window.localStorage.removeItem(SUBSCRIPTION_CACHE_KEY)
      return null
    }
    return parsed.data
  } catch (error) {
    console.error('[useSubscription] Failed to read cache:', error)
    return null
  }
}

const writeCache = (data: SubscriptionSummary) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      SUBSCRIPTION_CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data })
    )
  } catch (error) {
    console.error('[useSubscription] Failed to write cache:', error)
  }
}

const clearCache = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SUBSCRIPTION_CACHE_KEY)
}

interface UseSubscriptionOptions {
  enabled?: boolean
  autoFetch?: boolean
}

interface SubscriptionState {
  data: SubscriptionSummary | null
  isLoading: boolean
  isRefreshing: boolean
  isChangingPlan: boolean
  error?: string
}

export interface UseSubscriptionResult {
  data: SubscriptionSummary | null
  isLoading: boolean
  isRefreshing: boolean
  isChangingPlan: boolean
  error?: string
  refresh: () => Promise<void>
  changePlan: (planCode: PlanCode) => Promise<{ success: boolean; error?: string }>
  createCheckoutSession: (planCode: PlanCode) => Promise<{ success: boolean; error?: string }>
  isAtLimit: boolean
  remaining: number
  limit: number
  used: number
}

const getAuthToken = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('[useSubscription] Failed to get session:', error)
    return null
  }
  return data.session?.access_token ?? null
}

export const useSubscription = (options: UseSubscriptionOptions = {}): UseSubscriptionResult => {
  const { enabled = true, autoFetch = true } = options
  const cachedSubscription = readCache()

  const [state, setState] = useState<SubscriptionState>({
    data: cachedSubscription,
    isLoading: enabled && autoFetch && !cachedSubscription,
    isRefreshing: false,
    isChangingPlan: false,
    error: undefined
  })

  const fetchSubscription = useCallback(async ({ silent = false } = {}) => {
    if (!enabled) return

    setState((prev) => ({
      ...prev,
      isLoading: silent ? prev.isLoading : true,
      isRefreshing: silent ? true : prev.isRefreshing,
      error: silent ? prev.error : undefined
    }))

    try {
      const token = await getAuthToken()
      if (!token) {
        clearCache()
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: 'Authentication required'
        }))
        return
      }

      const response = await fetch('/api/subscription', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const payload: SubscriptionResponse & { success: boolean } = await response.json()

      if (!response.ok || !payload.success || !payload.subscription) {
        if (response.status === 401 || response.status === 403) {
          clearCache()
        }
        throw new Error(payload.error || `HTTP ${response.status}`)
      }

      writeCache(payload.subscription)

      setState({
        data: payload.subscription,
        isLoading: false,
        isRefreshing: false,
        isChangingPlan: false,
        error: undefined
      })
    } catch (error) {
      console.error('[useSubscription] Failed to load subscription:', error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? error.message : 'Failed to load subscription'
      }))
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || !autoFetch) return
    fetchSubscription().catch((error) => {
      console.error('[useSubscription] Initial fetch failed:', error)
    })
  }, [autoFetch, enabled, fetchSubscription])

  const refresh = useCallback(async () => {
    await fetchSubscription({ silent: true })
  }, [fetchSubscription])

  const changePlan = useCallback<UseSubscriptionResult['changePlan']>(async (planCode) => {
    if (!enabled) {
      return { success: false, error: 'Subscription updates disabled in this context' }
    }

    setState((prev) => ({ ...prev, isChangingPlan: true, error: undefined }))

    try {
      const token = await getAuthToken()
      if (!token) {
        clearCache()
        setState((prev) => ({ ...prev, isChangingPlan: false, error: 'Authentication required' }))
        return { success: false, error: 'Authentication required' }
      }

      const response = await fetch('/api/subscription/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ planCode })
      })

      const payload: ChangePlanResponse & { success: boolean } = await response.json()

      if (!response.ok || !payload.success || !payload.subscription) {
        throw new Error(payload.error || `HTTP ${response.status}`)
      }

      writeCache(payload.subscription)

      setState({
        data: payload.subscription,
        isLoading: false,
        isRefreshing: false,
        isChangingPlan: false,
        error: undefined
      })

      return { success: true }
    } catch (error) {
      console.error('[useSubscription] Failed to change plan:', error)
      const message = error instanceof Error ? error.message : 'Failed to update plan'
      setState((prev) => ({ ...prev, isChangingPlan: false, error: message }))
      return { success: false, error: message }
    }
  }, [enabled])

  const createCheckoutSession = useCallback(async (planCode: PlanCode) => {
    if (!enabled) return { success: false, error: 'Disabled' }

    try {
      const token = await getAuthToken()
      if (!token) throw new Error('Authentication required')

      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ planCode })
      })

      const data = await response.json()
      if (!data.success || !data.url) {
        throw new Error(data.error || 'Failed to create session')
      }

      window.location.href = data.url
      return { success: true }
    } catch (error: any) {
      console.error('[useSubscription] Checkout error:', error)
      return { success: false, error: error.message }
    }
  }, [enabled])

  const usage = state.data?.usage

  const { isAtLimit, remaining, limit, used } = useMemo(() => {
    if (!usage) {
      return { isAtLimit: false, remaining: 0, limit: 0, used: 0 }
    }

    return {
      isAtLimit: usage.remaining <= 0,
      remaining: usage.remaining,
      limit: usage.limit,
      used: usage.used
    }
  }, [usage])

  return {
    data: state.data,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    isChangingPlan: state.isChangingPlan,
    error: state.error,
    refresh,
    changePlan,
    createCheckoutSession,
    isAtLimit,
    remaining,
    limit,
    used
  }
}

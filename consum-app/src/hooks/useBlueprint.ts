import { useState, useCallback } from 'react'
import type { BlueprintFormData, AIBlueprint, BlueprintStatus } from '../types/blueprint'
import { supabase } from '../lib/supabase'
import type { QuotaExceededPayload, SubscriptionSummary } from '../types/subscription'

interface BlueprintState {
  isLoading: boolean
  blueprint?: AIBlueprint
  metadata?: {
    contentType: 'youtube' | 'text'
    url?: string
    videoId?: string
    transcriptLength?: number
    language?: string
  }
  error?: string
  queuedBlueprint?: {
    id: string
    status: BlueprintStatus
    goal: string
    createdAt: string
  }
  subscription?: SubscriptionSummary
  quotaError?: QuotaExceededPayload
}

export interface CreateBlueprintResult {
  success: boolean
  queued: boolean
  subscription?: SubscriptionSummary
  errorCode?: string
  errorMessage?: string
}

interface UseBlueprintReturn extends BlueprintState {
  createBlueprint: (formData: BlueprintFormData) => Promise<CreateBlueprintResult>
  clearBlueprint: () => void
}

export const useBlueprint = (): UseBlueprintReturn => {
  const [state, setState] = useState<BlueprintState>({
    isLoading: false
  })

  const createBlueprint = useCallback(async (formData: BlueprintFormData): Promise<CreateBlueprintResult> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: undefined,
      queuedBlueprint: undefined,
      quotaError: undefined
    }))

    try {
      console.log('[useBlueprint] Starting blueprint creation for:', formData.goal)

      // Ensure the user is authenticated before calling the backend
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession()

      if (sessionError || !session?.access_token) {
        console.error('[useBlueprint] Missing auth session for blueprint creation', sessionError)
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Authentication required. Please log in.'
        }))
        return {
          success: false,
          queued: false,
          errorCode: 'auth_required',
          errorMessage: 'Authentication required. Please log in.'
        }
      }

      // Call single blueprint creation endpoint
      const response = await fetch('/api/create-blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[useBlueprint] API error:', data)

        if (response.status === 429 && data?.code === 'quota_exceeded' && data?.subscription) {
          const quotaPayload: QuotaExceededPayload = {
            code: 'quota_exceeded',
            message: data.error || 'Subscription quota reached',
            subscription: data.subscription as SubscriptionSummary
          }

          setState(prev => ({
            ...prev,
            isLoading: false,
            error: quotaPayload.message,
            quotaError: quotaPayload,
            subscription: quotaPayload.subscription
          }))

          return {
            success: false,
            queued: false,
            subscription: quotaPayload.subscription,
            errorCode: 'quota_exceeded',
            errorMessage: quotaPayload.message
          }
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || `HTTP ${response.status}: Request failed`
        }))

        return {
          success: false,
          queued: false,
          errorCode: data.code,
          errorMessage: data.error || `HTTP ${response.status}: Request failed`
        }
      }

      if (!data.success) {
        console.error('[useBlueprint] Blueprint creation failed:', data.error)
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Blueprint creation failed'
        }))
        return {
          success: false,
          queued: false,
          errorCode: data.code,
          errorMessage: data.error || 'Blueprint creation failed'
        }
      }

      if (response.status === 202 || data.status === 'pending') {
        console.log('[useBlueprint] Blueprint queued for background processing')

        const saved = data.savedBlueprint
        const subscriptionSummary = data.subscription as SubscriptionSummary | undefined

        setState(prev => ({
          ...prev,
          isLoading: false,
          blueprint: undefined,
          metadata: undefined,
          error: undefined,
           subscription: subscriptionSummary ?? prev.subscription,
          queuedBlueprint: saved
            ? {
                id: saved.id,
                status: saved.status,
                goal: saved.goal,
                createdAt: saved.created_at
              }
            : undefined
        }))

        return {
          success: true,
          queued: true,
          subscription: subscriptionSummary
        }
      }

      // Success with immediate blueprint
      console.log('[useBlueprint] Successfully created blueprint')

      const subscriptionSummary = data.subscription as SubscriptionSummary | undefined

      setState(prev => ({
        ...prev,
        isLoading: false,
        blueprint: data.blueprint,
        metadata: data.metadata,
        error: undefined,
        queuedBlueprint: undefined,
        subscription: subscriptionSummary ?? prev.subscription
      }))

      return {
        success: true,
        queued: false,
        subscription: subscriptionSummary
      }

    } catch (error) {
      console.error('[useBlueprint] Network error:', error)
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Network error - please check your connection'

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        queuedBlueprint: undefined
      }))

      return {
        success: false,
        queued: false,
        errorMessage
      }
    }
  }, [])

  const clearBlueprint = useCallback(() => {
    setState(prev => ({
      isLoading: false,
      blueprint: undefined,
      metadata: undefined,
      error: undefined,
      queuedBlueprint: undefined,
      subscription: prev.subscription,
      quotaError: undefined
    }))
  }, [])

  return {
    ...state,
    createBlueprint,
    clearBlueprint
  }
}
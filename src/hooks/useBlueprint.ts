import { useState, useCallback } from 'react'
import type { BlueprintFormData, AIBlueprint, BlueprintStatus } from '../types/blueprint'
import { supabase } from '../lib/supabase'

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
}

interface UseBlueprintReturn extends BlueprintState {
  createBlueprint: (formData: BlueprintFormData) => Promise<boolean>
  clearBlueprint: () => void
}

export const useBlueprint = (): UseBlueprintReturn => {
  const [state, setState] = useState<BlueprintState>({
    isLoading: false
  })

  const createBlueprint = useCallback(async (formData: BlueprintFormData): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined, queuedBlueprint: undefined }))

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
        return false
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
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || `HTTP ${response.status}: Request failed`
        }))
        return false
      }

      if (!data.success) {
        console.error('[useBlueprint] Blueprint creation failed:', data.error)
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Blueprint creation failed'
        }))
        return false
      }

      if (response.status === 202 || data.status === 'pending') {
        console.log('[useBlueprint] Blueprint queued for background processing')

        const saved = data.savedBlueprint

        setState(prev => ({
          ...prev,
          isLoading: false,
          blueprint: undefined,
          metadata: undefined,
          error: undefined,
          queuedBlueprint: saved
            ? {
                id: saved.id,
                status: saved.status,
                goal: saved.goal,
                createdAt: saved.created_at
              }
            : undefined
        }))

        return true
      }

      // Success with immediate blueprint
      console.log('[useBlueprint] Successfully created blueprint')

      setState(prev => ({
        ...prev,
        isLoading: false,
        blueprint: data.blueprint,
        metadata: data.metadata,
        error: undefined,
        queuedBlueprint: undefined
      }))

      return true

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

      return false
    }
  }, [])

  const clearBlueprint = useCallback(() => {
    setState({
      isLoading: false,
      blueprint: undefined,
      metadata: undefined,
      error: undefined,
      queuedBlueprint: undefined
    })
  }, [])

  return {
    ...state,
    createBlueprint,
    clearBlueprint
  }
}
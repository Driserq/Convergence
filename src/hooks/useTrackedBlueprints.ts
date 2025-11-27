import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  buildItemIdentifier,
  calculateHabitStreak,
  extractDailyHabits,
  extractDecisionChecklist,
  extractSequentialSteps,
  extractTriggerActions,
  getLocalISODate
} from '../lib/tracking'
import type {
  BlueprintCompletionRecord,
  CompletionMutationPayload,
  CompletionMutationResponse,
  ToggleTrackingPayload,
  ToggleTrackingResponse,
  TrackingOverviewResponse,
  TrackedBlueprintWithBlueprint,
  TrackedSectionType
} from '../types/tracking'

interface HabitDisplayItem {
  blueprintId: string
  blueprintTitle: string
  itemId: string
  title: string
  description: string
  timeframe?: string
  completedToday: boolean
  streak: number
  completions: BlueprintCompletionRecord[]
}

interface ActionStepDisplayItem {
  blueprintId: string
  itemId: string
  title: string
  description: string
  timeframe?: string
  deliverable?: string
  completed: boolean
  completedOn?: string
  completions: BlueprintCompletionRecord[]
}

interface DecisionChecklistDisplayItem {
  blueprintId: string
  itemId: string
  question: string
  weight?: string
  completed: boolean
  completedOn?: string
  completions: BlueprintCompletionRecord[]
}

interface TriggerActionDisplayItem {
  blueprintId: string
  itemId: string
  situation: string
  action: string
  timeframe?: string
}

interface ActionBlueprintGroup {
  blueprintId: string
  blueprintTitle: string
  sequentialSteps: ActionStepDisplayItem[]
  decisionChecklist: DecisionChecklistDisplayItem[]
  triggerActions: TriggerActionDisplayItem[]
}

interface TrackingState {
  isLoading: boolean
  isRefreshing: boolean
  error?: string
  tracked: TrackedBlueprintWithBlueprint[]
  completions: BlueprintCompletionRecord[]
  counts: {
    habitsTracked: number
    actionsTracked: number
  }
  limits: {
    habits: number
    actions: number
  }
}

const initialState: TrackingState = {
  isLoading: true,
  isRefreshing: false,
  tracked: [],
  completions: [],
  counts: {
    habitsTracked: 0,
    actionsTracked: 0
  },
  limits: {
    habits: 5,
    actions: 7
  }
}

const buildCompletionKey = (blueprintId: string, sectionType: TrackedSectionType, itemId: string) =>
  `${blueprintId}:${sectionType}:${itemId}`

const mergeCompletion = (
  completions: BlueprintCompletionRecord[],
  completion: BlueprintCompletionRecord
): BlueprintCompletionRecord[] => {
  const filtered = completions.filter(
    (entry) =>
      !(
        entry.blueprintId === completion.blueprintId &&
        entry.sectionType === completion.sectionType &&
        entry.itemId === completion.itemId &&
        entry.completedOn === completion.completedOn
      )
  )
  return [...filtered, completion]
}

const removeCompletion = (
  completions: BlueprintCompletionRecord[],
  blueprintId: string,
  sectionType: TrackedSectionType,
  itemId: string,
  completedOn?: string
): BlueprintCompletionRecord[] =>
  completions.filter((entry) => {
    if (entry.blueprintId !== blueprintId) return true
    if (entry.sectionType !== sectionType) return true
    if (entry.itemId !== itemId) return true
    if (completedOn) {
      return entry.completedOn !== completedOn
    }
    return false
  })

const getAuthToken = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('[useTrackedBlueprints] Failed to get session:', error)
    return null
  }
  return data.session?.access_token ?? null
}

export interface UseTrackedBlueprintsResult {
  isLoading: boolean
  isRefreshing: boolean
  error?: string
  tracked: TrackedBlueprintWithBlueprint[]
  completions: BlueprintCompletionRecord[]
  counts: TrackingState['counts']
  limits: TrackingState['limits']
  habitItems: HabitDisplayItem[]
  actionGroups: ActionBlueprintGroup[]
  toggleTracking: (payload: ToggleTrackingPayload) => Promise<{ success: boolean; error?: string }>
  toggleCompletion: (payload: CompletionMutationPayload) => Promise<{ success: boolean; error?: string }>
  loadingTrackingFor: Record<string, boolean>
  loadingCompletionFor: Record<string, boolean>
  refresh: () => Promise<void>
}

export const useTrackedBlueprints = (): UseTrackedBlueprintsResult => {
  const [state, setState] = useState<TrackingState>(initialState)
  const [loadingTrackingFor, setLoadingTrackingFor] = useState<Record<string, boolean>>({})
  const [loadingCompletionFor, setLoadingCompletionFor] = useState<Record<string, boolean>>({})
  const todayRef = useRef<string>(getLocalISODate())

  const fetchTracking = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options

    setState((prev) => ({
      ...prev,
      isLoading: silent ? prev.isLoading : true,
      isRefreshing: silent ? true : prev.isRefreshing,
      error: silent ? prev.error : undefined
    }))

    try {
      const token = await getAuthToken()
      if (!token) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: 'Authentication required'
        }))
        return
      }

      const response = await fetch('/api/tracking', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data: TrackingOverviewResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      setState({
        isLoading: false,
        isRefreshing: false,
        tracked: data.tracked,
        completions: data.completions,
        counts: data.counts,
        limits: data.limits
      })
    } catch (error) {
      console.error('[useTrackedBlueprints] Failed to fetch tracking data:', error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? error.message : 'Failed to load tracking data'
      }))
    }
  }, [])

  useEffect(() => {
    fetchTracking()
  }, [fetchTracking])

  const habitItems = useMemo<HabitDisplayItem[]>(() => {
    const today = todayRef.current

    const completionMap = state.completions.reduce<Map<string, BlueprintCompletionRecord[]>>((acc, completion) => {
      const key = buildCompletionKey(completion.blueprintId, completion.sectionType, completion.itemId)
      const existing = acc.get(key) ?? []
      existing.push(completion)
      acc.set(key, existing)
      return acc
    }, new Map())

    const items: HabitDisplayItem[] = []

    state.tracked
      .filter((entry) => entry.trackHabits)
      .forEach((entry) => {
        const blueprintLabel = entry.blueprint.title && entry.blueprint.title.trim().length > 0
          ? entry.blueprint.title.trim()
          : entry.blueprint.goal

        const habits = extractDailyHabits(entry.blueprint.ai_output)
        habits.forEach((habit, index) => {
          const itemId = buildItemIdentifier('habit', habit.id, habit.title, index)
          const key = buildCompletionKey(entry.blueprintId, 'daily_habit', itemId)
          const completions = completionMap.get(key) ?? []
          const completedToday = completions.some((completion) => completion.completedOn === today)
          const streak = calculateHabitStreak(
            completions.map((completion) => completion.completedOn),
            today
          )

          items.push({
            blueprintId: entry.blueprintId,
            blueprintTitle: blueprintLabel,
            itemId,
            title: habit.title,
            description: habit.description,
            timeframe: habit.timeframe,
            completedToday,
            streak,
            completions
          })
        })
      })

    return items
  }, [state.tracked, state.completions])

  const actionGroups = useMemo<ActionBlueprintGroup[]>(() => {
    const completionMap = state.completions.reduce<Map<string, BlueprintCompletionRecord[]>>((acc, completion) => {
      const key = buildCompletionKey(completion.blueprintId, completion.sectionType, completion.itemId)
      const existing = acc.get(key) ?? []
      existing.push(completion)
      acc.set(key, existing)
      return acc
    }, new Map())

    return state.tracked
      .filter((entry) => entry.trackActions)
      .map<ActionBlueprintGroup>((entry) => {
        const blueprintLabel = entry.blueprint.title && entry.blueprint.title.trim().length > 0
          ? entry.blueprint.title.trim()
          : entry.blueprint.goal

        const sequentialSteps = extractSequentialSteps(entry.blueprint.ai_output).map((step, index) => {
          const itemId = buildItemIdentifier('sequential', step.step_number, step.title, index)
          const key = buildCompletionKey(entry.blueprintId, 'sequential_step', itemId)
          const completions = completionMap.get(key) ?? []
          const sorted = [...completions].sort((a, b) => (a.completedAt > b.completedAt ? -1 : a.completedAt < b.completedAt ? 1 : 0))

          return {
            blueprintId: entry.blueprintId,
            itemId,
            title: step.title,
            description: step.description,
            timeframe: step.estimated_time,
            deliverable: step.deliverable,
            completed: sorted.length > 0,
            completedOn: sorted[0]?.completedOn,
            completions
          }
        })

        const decisionChecklist = extractDecisionChecklist(entry.blueprint.ai_output).map((item, index) => {
          const itemId = buildItemIdentifier('decision', item.question, item.question, index)
          const key = buildCompletionKey(entry.blueprintId, 'decision_checklist', itemId)
          const completions = completionMap.get(key) ?? []
          const sorted = [...completions].sort((a, b) => (a.completedAt > b.completedAt ? -1 : a.completedAt < b.completedAt ? 1 : 0))

          return {
            blueprintId: entry.blueprintId,
            itemId,
            question: item.question,
            weight: item.weight,
            completed: sorted.length > 0,
            completedOn: sorted[0]?.completedOn,
            completions
          }
        })

        const triggerActions = extractTriggerActions(entry.blueprint.ai_output).map((action, index) => ({
          blueprintId: entry.blueprintId,
          itemId: buildItemIdentifier('trigger', `${action.situation}-${index}`, action.situation, index),
          situation: action.situation,
          action: action.immediate_action,
          timeframe: action.timeframe
        }))

        return {
          blueprintId: entry.blueprintId,
          blueprintTitle: blueprintLabel,
          sequentialSteps,
          decisionChecklist,
          triggerActions
        }
      })
      .filter(
        (group) =>
          group.sequentialSteps.length > 0 ||
          group.decisionChecklist.length > 0 ||
          group.triggerActions.length > 0
      )
  }, [state.tracked, state.completions])

  const refresh = useCallback(async () => {
    await fetchTracking({ silent: true })
  }, [fetchTracking])

  const toggleTracking = useCallback<UseTrackedBlueprintsResult['toggleTracking']>(
    async (payload) => {
      const key = payload.blueprintId
      setLoadingTrackingFor((prev) => ({ ...prev, [key]: true }))

      try {
        const token = await getAuthToken()
        if (!token) {
          return { success: false, error: 'Authentication required' }
        }

        const response = await fetch('/api/tracking/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })

        const data: ToggleTrackingResponse & { success: boolean; error?: string } = await response.json()

        if (!response.ok || !data.success) {
          return { success: false, error: data.error || `HTTP ${response.status}` }
        }

        await fetchTracking({ silent: true })

        return { success: true }
      } catch (error) {
        console.error('[useTrackedBlueprints] Failed to toggle tracking:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update tracking' }
      } finally {
        setLoadingTrackingFor((prev) => ({ ...prev, [key]: false }))
      }
    },
    [fetchTracking]
  )

  const toggleCompletion = useCallback<UseTrackedBlueprintsResult['toggleCompletion']>(
    async ({ completedOn, ...payload }) => {
      const key = buildCompletionKey(payload.blueprintId, payload.sectionType, payload.itemId)
      setLoadingCompletionFor((prev) => ({ ...prev, [key]: true }))

      try {
        const token = await getAuthToken()
        if (!token) {
          return { success: false, error: 'Authentication required' }
        }

        const body: CompletionMutationPayload = {
          ...payload,
          completedOn: completedOn ?? getLocalISODate(),
        }

        const response = await fetch('/api/tracking/completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        })

        const data: CompletionMutationResponse & { success: boolean; error?: string } = await response.json()

        if (!response.ok || !data.success) {
          return { success: false, error: data.error || `HTTP ${response.status}` }
        }

        setState((prev) => {
          if (payload.completed && data.completion) {
            return {
              ...prev,
              completions: mergeCompletion(prev.completions, data.completion)
            }
          }

          const effectiveCompletedOn = completedOn ?? getLocalISODate()
          return {
            ...prev,
            completions: removeCompletion(
              prev.completions,
              payload.blueprintId,
              payload.sectionType,
              payload.itemId,
              effectiveCompletedOn
            )
          }
        })

        return { success: true }
      } catch (error) {
        console.error('[useTrackedBlueprints] Failed to toggle completion:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update completion' }
      } finally {
        setLoadingCompletionFor((prev) => ({ ...prev, [key]: false }))
      }
    },
    []
  )

  return {
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    tracked: state.tracked,
    completions: state.completions,
    counts: state.counts,
    limits: state.limits,
    habitItems,
    actionGroups,
    toggleTracking,
    toggleCompletion,
    loadingTrackingFor,
    loadingCompletionFor,
    refresh
  }
}

export type { HabitDisplayItem, ActionBlueprintGroup }

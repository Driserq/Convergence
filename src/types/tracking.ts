import type { Blueprint } from './blueprint.js'

export type TrackedSectionType = 'daily_habit' | 'sequential_step' | 'decision_checklist'

export interface TrackedBlueprintRecord {
  id: string
  userId: string
  blueprintId: string
  trackHabits: boolean
  trackActions: boolean
  createdAt: string
}

export interface TrackedBlueprintWithBlueprint extends TrackedBlueprintRecord {
  blueprint: Blueprint
}

export interface BlueprintCompletionRecord {
  id: string
  userId: string
  blueprintId: string
  sectionType: TrackedSectionType
  itemId: string
  completedOn: string
  completedAt: string
}

export interface ToggleTrackingPayload {
  blueprintId: string
  trackHabits?: boolean
  trackActions?: boolean
}

export interface ToggleTrackingResponse {
  success: boolean
  tracked: TrackedBlueprintRecord
  limits?: {
    habitsTracked: number
    habitsLimit: number
    actionsTracked: number
    actionsLimit: number
  }
  message?: string
}

export interface CompletionMutationPayload {
  blueprintId: string
  sectionType: TrackedSectionType
  itemId: string
  completed: boolean
  completedOn?: string
}

export interface CompletionMutationResponse {
  success: boolean
  completion?: BlueprintCompletionRecord
}

export interface TrackingOverviewResponse {
  success: boolean
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
  error?: string
}

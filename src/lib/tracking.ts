import type {
  AdaptiveBlueprintOutput,
  DailyHabit,
  DecisionQuestion,
  SequentialStep,
  TriggerAction,
  AIBlueprint
} from '../types/blueprint.js'

const sanitizeIdentifier = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const fallbackIdentifier = (index: number): string => index.toString()
export const buildItemIdentifier = (
  prefix: string,
  idValue: string | number | null | undefined,
  title: string | null | undefined,
  index: number
): string => {
  if (idValue !== undefined && idValue !== null && `${idValue}`.trim().length > 0) {
    return `${prefix}-${idValue}`
  }

  if (title && title.trim().length > 0) {
    return `${prefix}-${sanitizeIdentifier(title).slice(0, 48)}`
  }

  return `${prefix}-${fallbackIdentifier(index)}`
}

export const getLocalISODate = (date = new Date()): string => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  const localDate = new Date(date.getTime() - offsetMs)
  return localDate.toISOString().slice(0, 10)
}

const previousDate = (dateString: string): string => {
  const parsed = new Date(`${dateString}T00:00:00`)
  parsed.setDate(parsed.getDate() - 1)
  return getLocalISODate(parsed)
}

export const calculateHabitStreak = (dates: string[], today: string): number => {
  if (!dates.length) return 0

  const uniqueDates = Array.from(new Set(dates)).sort((a, b) => (a > b ? -1 : a < b ? 1 : 0))
  let streak = 0
  let cursor = today

  for (const date of uniqueDates) {
    if (date === cursor) {
      streak += 1
      cursor = previousDate(cursor)
      continue
    }

    if (date > cursor) {
      continue
    }

    const expected = previousDate(cursor)
    if (date === expected) {
      streak += 1
      cursor = previousDate(cursor)
      continue
    }

    break
  }

  return streak
}

export const extractDailyHabits = (blueprint: AIBlueprint | null): DailyHabit[] => {
  if (!blueprint) return []

  if ('daily_habits' in blueprint && Array.isArray(blueprint.daily_habits)) {
    return blueprint.daily_habits
  }

  if ('habits' in blueprint && Array.isArray(blueprint.habits)) {
    return blueprint.habits as DailyHabit[]
  }

  return []
}

export const extractSequentialSteps = (blueprint: AIBlueprint | null): SequentialStep[] => {
  if (!blueprint) return []
  if ('sequential_steps' in (blueprint as AdaptiveBlueprintOutput) && Array.isArray((blueprint as AdaptiveBlueprintOutput).sequential_steps)) {
    return (blueprint as AdaptiveBlueprintOutput).sequential_steps ?? []
  }
  return []
}

export const extractDecisionChecklist = (blueprint: AIBlueprint | null): DecisionQuestion[] => {
  if (!blueprint) return []
  if ('decision_checklist' in (blueprint as AdaptiveBlueprintOutput) && Array.isArray((blueprint as AdaptiveBlueprintOutput).decision_checklist)) {
    return (blueprint as AdaptiveBlueprintOutput).decision_checklist ?? []
  }
  return []
}

export const extractTriggerActions = (blueprint: AIBlueprint | null): TriggerAction[] => {
  if (!blueprint) return []
  if ('trigger_actions' in (blueprint as AdaptiveBlueprintOutput) && Array.isArray((blueprint as AdaptiveBlueprintOutput).trigger_actions)) {
    return (blueprint as AdaptiveBlueprintOutput).trigger_actions ?? []
  }
  return []
}

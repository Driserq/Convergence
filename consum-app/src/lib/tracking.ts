import type {
  AdaptiveBlueprintOutput,
  DailyHabit,
  TroubleshootingItem,
  DecisionQuestion,
  Resource
} from '../types/blueprint'

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

export interface SectionContext {
  sectionId: string
  sectionTitle: string
}

export const extractDailyHabitsWithContext = (blueprint: AIBlueprint | null): Array<DailyHabit & SectionContext> => {
  if (!blueprint) return []
  const items: Array<DailyHabit & SectionContext> = []

  // Dynamic Sections
  if ('sections' in blueprint && Array.isArray(blueprint.sections)) {
    blueprint.sections.forEach((section, sIdx) => {
      if (section.type === 'daily_habits') {
        (section.items as DailyHabit[]).forEach((item, iIdx) => {
          items.push({
            ...item,
            id: item.id || (sIdx * 1000 + iIdx), // Ensure ID uniqueness
            sectionId: `section_${sIdx}_daily_habits`,
            sectionTitle: section.title
          })
        })
      }
    })
    if (items.length > 0) return items
  }

  // Legacy Fallback
  const legacyItems = extractDailyHabits(blueprint)
  return legacyItems.map(item => ({
    ...item,
    sectionId: 'legacy_daily_habits',
    sectionTitle: 'Daily Habits'
  }))
}

export const extractSequentialStepsWithContext = (blueprint: AIBlueprint | null): Array<SequentialStep & SectionContext> => {
  if (!blueprint) return []
  const items: Array<SequentialStep & SectionContext> = []

  if ('sections' in blueprint && Array.isArray(blueprint.sections)) {
    blueprint.sections.forEach((section, sIdx) => {
      if (section.type === 'sequential_steps') {
        (section.items as SequentialStep[]).forEach((item, iIdx) => {
          items.push({
            ...item,
            step_number: item.step_number || (iIdx + 1),
            sectionId: `section_${sIdx}_sequential_steps`,
            sectionTitle: section.title
          })
        })
      }
    })
    if (items.length > 0) return items
  }

  return extractSequentialSteps(blueprint).map(item => ({
    ...item,
    sectionId: 'legacy_sequential_steps',
    sectionTitle: 'Step By Step'
  }))
}

export const extractDailyHabits = (blueprint: AIBlueprint | null): DailyHabit[] => {
  if (!blueprint) return []

  // Fallback for when context is not needed or legacy calls
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
  
  if ('sections' in blueprint && Array.isArray(blueprint.sections)) {
     const items: DecisionQuestion[] = []
     blueprint.sections.forEach(section => {
       if (section.type === 'decision_checklist') {
         items.push(...(section.items as DecisionQuestion[]))
       }
     })
     if (items.length > 0) return items
  }

  if ('decision_checklist' in (blueprint as AdaptiveBlueprintOutput) && Array.isArray((blueprint as AdaptiveBlueprintOutput).decision_checklist)) {
    return (blueprint as AdaptiveBlueprintOutput).decision_checklist ?? []
  }
  return []
}

export const extractTriggerActions = (blueprint: AIBlueprint | null): TroubleshootingItem[] => {
  // Deprecated: No longer tracking triggers in the same way, but kept for type compatibility
  // or potential future use with troubleshooting items.
  return []
}

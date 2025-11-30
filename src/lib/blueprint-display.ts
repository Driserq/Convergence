import type { AIBlueprint, OverviewSection } from '../types/blueprint'

/**
 * Format a blueprint timestamp into human-readable form.
 */
export function formatBlueprintDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Provide a short preview of the blueprint overview summary.
 */
export function getOverviewPreview(aiOutput: AIBlueprint | null, maxLength = 110): string {
  if (!aiOutput) {
    return 'No overview available'
  }

  if (typeof aiOutput.overview === 'object' && 'summary' in aiOutput.overview) {
    const summary = (aiOutput.overview as OverviewSection).summary || ''
    return summary.length > maxLength ? `${summary.substring(0, maxLength)}…` : summary
  }

  if (typeof aiOutput.overview === 'string') {
    const firstParagraph = aiOutput.overview.split('\n\n')[0]
    return firstParagraph.length > maxLength ? `${firstParagraph.substring(0, maxLength)}…` : firstParagraph
  }

  return 'No overview available'
}

/**
 * Normalize overview content (summary, mistakes, guidance).
 */
export function parseOverview(aiOutput: AIBlueprint | null): {
  summary: string
  mistakes: string[]
  guidance: string[]
} {
  if (!aiOutput) {
    return {
      summary: 'No overview available',
      mistakes: [],
      guidance: [],
    }
  }

  if (typeof aiOutput.overview === 'object' && 'summary' in aiOutput.overview) {
    const overview = aiOutput.overview as OverviewSection
    return {
      summary: overview.summary || '',
      mistakes: overview.mistakes || [],
      guidance: overview.guidance || [],
    }
  }

  if (typeof aiOutput.overview === 'string') {
    const paragraphs = aiOutput.overview.split('\n\n')
    const summary = paragraphs[0] || ''

    const mistakes: string[] = []
    const guidance: string[] = []

    for (const para of paragraphs.slice(1)) {
      const lower = para.toLowerCase()
      const lines = para.split('\n').map((line) => line.trim()).filter(Boolean)

      if (lower.includes('mistake') || lower.includes('avoid')) {
        mistakes.push(...lines)
      } else if (lower.includes('guidance') || lower.includes('success') || lower.includes('tip')) {
        guidance.push(...lines)
      }
    }

    return { summary, mistakes, guidance }
  }

  return {
    summary: 'No overview available',
    mistakes: [],
    guidance: [],
  }
}

/**
 * Collect Step By Step actions and lifestyle habits from adaptive outputs.
 */
const isNonEmpty = (value?: string | null): boolean => {
  if (typeof value !== 'string') return false
  return value.trim().length > 0
}

const sanitizeString = (value?: string | null): string =>
  typeof value === 'string' ? value.trim() : ''

export function getHabitsOrSteps(aiOutput: AIBlueprint | null): Array<{
  id: number
  title: string
  description: string
  timeframe?: string
}> {
  if (!aiOutput) {
    return []
  }

  if ('habits' in aiOutput && Array.isArray(aiOutput.habits)) {
    return aiOutput.habits
      .map((habit) => ({
        id: habit.id,
        title: sanitizeString(habit.title),
        description: sanitizeString(habit.description),
        timeframe: sanitizeString(habit.timeframe),
      }))
      .filter((habit) => isNonEmpty(habit.title) || isNonEmpty(habit.description))
  }

  const steps: Array<{
    id: number
    title: string
    description: string
    timeframe?: string
  }> = []

  if ('sequential_steps' in aiOutput && Array.isArray(aiOutput.sequential_steps)) {
    aiOutput.sequential_steps.forEach((step, index) => {
      const title = sanitizeString(step.title)
      const description = sanitizeString(step.description)
      const timeframe = sanitizeString(step.estimated_time)

      if (isNonEmpty(title) || isNonEmpty(description)) {
        steps.push({
          id: step.step_number || index + 1,
          title,
          description,
          timeframe,
        })
      }
    })
  }

  if ('daily_habits' in aiOutput && Array.isArray(aiOutput.daily_habits)) {
    aiOutput.daily_habits.forEach((habit) => {
      const title = sanitizeString(habit.title)
      const description = sanitizeString(habit.description)
      const timeframe = sanitizeString(habit.timeframe)

      if (isNonEmpty(title) || isNonEmpty(description)) {
        steps.push({
          id: habit.id,
          title,
          description,
          timeframe,
        })
      }
    })
  }

  if ('trigger_actions' in aiOutput && Array.isArray(aiOutput.trigger_actions)) {
    aiOutput.trigger_actions.forEach((action, idx) => {
      const situation = sanitizeString(action.situation)
      const immediateAction = sanitizeString(action.immediate_action)
      const timeframe = sanitizeString(action.timeframe)

      if (isNonEmpty(situation) || isNonEmpty(immediateAction)) {
        steps.push({
          id: steps.length + idx + 1,
          title: situation,
          description: immediateAction,
          timeframe,
        })
      }
    })
  }

  return steps
}

/**
 * Search the serialized blueprint for a query string.
 */
export function searchInBlueprint(aiOutput: AIBlueprint | null, query: string): boolean {
  if (!query.trim()) return true
  if (!aiOutput) return false

  const searchText = JSON.stringify(aiOutput).toLowerCase()
  return searchText.includes(query.toLowerCase())
}

export interface BlueprintSection {
  id: string
  title: string
  description?: string
  items: Array<
    | { type: 'paragraph'; content: string }
    | { type: 'list'; items: string[] }
    | { type: 'step'; stepNumber: number; title: string; description: string; meta?: string; deliverable?: string }
    | { type: 'resource'; name: string; description: string; tag: string }
    | { type: 'trigger'; situation: string; action: string; timeframe?: string }
    | { type: 'checklist'; question: string; weight?: string }
  >
}

/**
 * Convert blueprint payload into normalized section definitions for rendering.
 */
export function mapBlueprintToSections(aiOutput: AIBlueprint | null): BlueprintSection[] {
  if (!aiOutput) {
    return []
  }

  const sections: BlueprintSection[] = []

  const overview = parseOverview(aiOutput)
  if (overview.summary || overview.mistakes.length || overview.guidance.length) {
    sections.push({
      id: 'overview',
      title: 'Overview',
      description: 'Key insights and guidance from the analyzed content.',
      items: [
        overview.summary && { type: 'paragraph', content: overview.summary },
        overview.mistakes.length && { type: 'list', items: overview.mistakes },
        overview.guidance.length && { type: 'list', items: overview.guidance },
      ].filter(Boolean) as BlueprintSection['items'],
    })
  }

  if ('sequential_steps' in aiOutput && Array.isArray(aiOutput.sequential_steps)) {
    const steps = aiOutput.sequential_steps
      .map((step, index) => ({
        stepNumber: step.step_number || index + 1,
        title: sanitizeString(step.title),
        description: sanitizeString(step.description),
        meta: sanitizeString(step.estimated_time),
        deliverable: sanitizeString(step.deliverable),
      }))
      .filter((step) => isNonEmpty(step.title) || isNonEmpty(step.description))

    if (steps.length) {
      sections.push({
        id: 'sequential_steps',
        title: 'Step By Step',
        description: 'Follow this Step By Step plan to turn insights into action.',
        items: steps.map((step) => ({
          type: 'step',
          stepNumber: step.stepNumber,
          title: step.title,
          description: step.description,
          meta: step.meta || undefined,
          deliverable: step.deliverable || undefined,
        })),
      })
    }
  }

  if ('daily_habits' in aiOutput && Array.isArray(aiOutput.daily_habits)) {
    const habits = aiOutput.daily_habits
      .map((habit) => ({
        id: habit.id,
        title: sanitizeString(habit.title),
        description: sanitizeString(habit.description),
        timeframe: sanitizeString(habit.timeframe),
      }))
      .filter((habit) => isNonEmpty(habit.title) || isNonEmpty(habit.description))

    if (habits.length) {
      sections.push({
        id: 'daily_habits',
        title: 'Daily Habits',
        description: 'Repeat these habits to reinforce the blueprint.',
        items: habits.map((habit) => ({
          type: 'step',
          stepNumber: habit.id,
          title: habit.title,
          description: habit.description,
          meta: habit.timeframe || undefined,
        })),
      })
    }
  }

  if ('trigger_actions' in aiOutput && Array.isArray(aiOutput.trigger_actions)) {
    const triggers = aiOutput.trigger_actions
      .map((action) => ({
        situation: sanitizeString(action.situation),
        action: sanitizeString(action.immediate_action),
        timeframe: sanitizeString(action.timeframe),
      }))
      .filter((action) => isNonEmpty(action.situation) || isNonEmpty(action.action))

    if (triggers.length) {
      sections.push({
        id: 'trigger_actions',
        title: 'Trigger Actions',
        description: 'Use these responses whenever risks or setbacks appear.',
        items: triggers.map((action) => ({
          type: 'trigger',
          situation: action.situation,
          action: action.action,
          timeframe: action.timeframe || undefined,
        })),
      })
    }
  }

  if ('decision_checklist' in aiOutput && Array.isArray(aiOutput.decision_checklist)) {
    const checklist = aiOutput.decision_checklist
      .map((item) => ({
        question: sanitizeString(item.question),
        weight: sanitizeString(item.weight),
      }))
      .filter((item) => isNonEmpty(item.question))

    if (checklist.length) {
      sections.push({
        id: 'decision_checklist',
        title: 'Decision Checklist',
        description: 'Evaluate these checkpoints before committing to actions.',
        items: checklist.map((item) => ({
          type: 'checklist',
          question: item.question,
          weight: item.weight || undefined,
        })),
      })
    }
  }

  if ('resources' in aiOutput && Array.isArray(aiOutput.resources)) {
    const resources = aiOutput.resources
      .map((resource) => ({
        name: sanitizeString(resource.name),
        description: sanitizeString(resource.description),
        tag: sanitizeString(resource.type),
      }))
      .filter((resource) => isNonEmpty(resource.name) || isNonEmpty(resource.description))

    if (resources.length) {
      sections.push({
        id: 'resources',
        title: 'Resources',
        description: 'Recommended materials surfaced in the original content.',
        items: resources.map((resource) => ({
          type: 'resource',
          name: resource.name,
          description: resource.description,
          tag: resource.tag || 'Resource',
        })),
      })
    }
  }

  if ('habits' in aiOutput && Array.isArray(aiOutput.habits) && aiOutput.habits.length && sections.length === 0) {
    const legacyHabits = aiOutput.habits
      .map((habit) => ({
        id: habit.id,
        title: sanitizeString(habit.title),
        description: sanitizeString(habit.description),
        timeframe: sanitizeString(habit.timeframe),
      }))
      .filter((habit) => isNonEmpty(habit.title) || isNonEmpty(habit.description))

    if (legacyHabits.length) {
      sections.push({
        id: 'habits',
        title: 'Habit Plan',
        description: 'Legacy blueprint habits formatted for quick review.',
        items: legacyHabits.map((habit) => ({
          type: 'step',
          stepNumber: habit.id,
          title: habit.title,
          description: habit.description,
          meta: habit.timeframe || undefined,
        })),
      })
    }
  }

  return sections
}

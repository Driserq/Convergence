import type { AIBlueprint, OverviewSection, LegacyBlueprintOutput } from '../../types/blueprint'

/**
 * Format a date string to a human-readable format
 * Example: "2025-10-22T18:30:00Z" → "Oct 22, 2025"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Extract preview text from blueprint overview
 * Returns first 100 characters with fade indication
 */
export function getOverviewPreview(aiOutput: AIBlueprint): string {
  if (!aiOutput) return 'No overview available'

  // Handle structured overview
  if (typeof aiOutput.overview === 'object' && 'summary' in aiOutput.overview) {
    const summary = (aiOutput.overview as OverviewSection).summary
    return summary.length > 100 ? `${summary.substring(0, 100)}...` : summary
  }

  // Handle legacy string overview (with \n\n breaks)
  if (typeof aiOutput.overview === 'string') {
    const firstParagraph = aiOutput.overview.split('\n\n')[0]
    return firstParagraph.length > 100 
      ? `${firstParagraph.substring(0, 100)}...` 
      : firstParagraph
  }

  return 'No overview available'
}

/**
 * Parse overview from AI output
 * Handles both structured and legacy formats
 */
export function parseOverview(aiOutput: AIBlueprint): {
  summary: string
  mistakes: string[]
  guidance: string[]
} {
  // Handle structured overview
  if (typeof aiOutput.overview === 'object' && 'summary' in aiOutput.overview) {
    const overview = aiOutput.overview as OverviewSection
    return {
      summary: overview.summary || '',
      mistakes: overview.mistakes || [],
      guidance: overview.guidance || [],
    }
  }

  // Handle legacy string format (with \n\n breaks)
  if (typeof aiOutput.overview === 'string') {
    const paragraphs = aiOutput.overview.split('\n\n')
    const summary = paragraphs[0] || ''
    
    // Try to detect mistakes/guidance sections
    const mistakes: string[] = []
    const guidance: string[] = []
    
    for (const para of paragraphs.slice(1)) {
      const lowerPara = para.toLowerCase()
      if (lowerPara.includes('mistake') || lowerPara.includes('avoid')) {
        // Extract bullet points or split by sentences
        const lines = para.split('\n').filter(l => l.trim())
        mistakes.push(...lines.filter(l => l.trim() !== ''))
      } else if (lowerPara.includes('guidance') || lowerPara.includes('success') || lowerPara.includes('tip')) {
        const lines = para.split('\n').filter(l => l.trim())
        guidance.push(...lines.filter(l => l.trim() !== ''))
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
 * Get habits/steps from AI output
 * Handles both new adaptive formats and legacy habits array
 */
export function getHabitsOrSteps(aiOutput: AIBlueprint): Array<{
  id: number
  title: string
  description: string
  timeframe?: string
}> {
  // Check for legacy habits format
  if ('habits' in aiOutput && Array.isArray(aiOutput.habits)) {
    return aiOutput.habits.map(h => ({
      id: h.id,
      title: h.title,
      description: h.description,
      timeframe: h.timeframe,
    }))
  }

  // Check for new adaptive formats
  const steps: Array<{
    id: number
    title: string
    description: string
    timeframe?: string
  }> = []

  if ('sequential_steps' in aiOutput && aiOutput.sequential_steps) {
    aiOutput.sequential_steps.forEach((step, idx) => {
      steps.push({
        id: step.step_number || idx + 1,
        title: step.title,
        description: step.description,
        timeframe: step.estimated_time,
      })
    })
  }

  if ('daily_habits' in aiOutput && aiOutput.daily_habits) {
    aiOutput.daily_habits.forEach((habit) => {
      steps.push({
        id: habit.id,
        title: habit.title,
        description: habit.description,
        timeframe: habit.timeframe,
      })
    })
  }

  if ('trigger_actions' in aiOutput && aiOutput.trigger_actions) {
    aiOutput.trigger_actions.forEach((action, idx) => {
      steps.push({
        id: steps.length + idx + 1,
        title: action.situation,
        description: action.immediate_action,
        timeframe: action.timeframe,
      })
    })
  }

  return steps
}

/**
 * Search within stringified blueprint data
 * Used for client-side filtering of ai_output JSONB
 */
export function searchInBlueprint(aiOutput: AIBlueprint, query: string): boolean {
  if (!query.trim()) return true
  
  const searchText = JSON.stringify(aiOutput).toLowerCase()
  return searchText.includes(query.toLowerCase())
}

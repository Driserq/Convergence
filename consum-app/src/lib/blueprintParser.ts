import { jsonrepair } from 'jsonrepair'
import type { AIBlueprint, AdaptiveBlueprintOutput } from '../types/blueprint.js'

interface RawBlueprintResponse {
  overview?: {
    summary?: string
    mistakes?: string[]
    guidance?: string[]
  }
  sequential_steps?: AdaptiveBlueprintOutput['sequential_steps']
  daily_habits?: AdaptiveBlueprintOutput['daily_habits']
  trigger_actions?: AdaptiveBlueprintOutput['trigger_actions']
  decision_checklist?: AdaptiveBlueprintOutput['decision_checklist']
  resources?: AdaptiveBlueprintOutput['resources']
  habits?: AdaptiveBlueprintOutput['daily_habits']
}

export class BlueprintParseError extends Error {
  rawSnippet: string
  sanitizedSnippet?: string

  constructor(message: string, raw: string, sanitized?: string) {
    super(message)
    this.name = 'BlueprintParseError'
    this.rawSnippet = raw.slice(0, 500)
    this.sanitizedSnippet = sanitized?.slice(0, 500)
  }
}

function stripCodeFence(text: string): string {
  const fenceMatch = text.match(/```(?:json|javascript|typescript|ts)?\s*([\s\S]*?)```/i)
  if (fenceMatch && typeof fenceMatch[1] === 'string' && fenceMatch[1].trim().length > 0) {
    return fenceMatch[1].trim()
  }
  return text
}

function extractJsonObject(text: string): string | null {
  let start = -1
  let depth = 0
  let inString = false
  let escape = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (start === -1) {
      if (char === '{') {
        start = i
        depth = 1
      }
      continue
    }

    if (inString) {
      if (escape) {
        escape = false
        continue
      }

      if (char === '\\') {
        escape = true
        continue
      }

      if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    if (char === '{') {
      depth += 1
      continue
    }

    if (char === '}') {
      depth -= 1
      if (depth === 0 && start !== -1) {
        return text.slice(start, i + 1)
      }
    }
  }

  return start !== -1 ? text.slice(start) : null
}

export function sanitizeGeminiResponse(aiText: string): string {
  const trimmed = aiText.trim()
  const withoutFence = stripCodeFence(trimmed)
  const extracted = extractJsonObject(withoutFence)
  if (extracted) {
    return extracted.trim()
  }
  return withoutFence
}

export function parseBlueprintResponse(aiText: string): AIBlueprint {
  const rawSnippet = aiText.slice(0, 500)
  const sanitized = sanitizeGeminiResponse(aiText)
  const sanitizedSnippet = sanitized.slice(0, 500)

  let parsed: RawBlueprintResponse

  try {
    parsed = JSON.parse(sanitized)
  } catch (error) {
    try {
      const repaired = jsonrepair(sanitized)
      parsed = JSON.parse(repaired)
    } catch (repairError) {
      throw new BlueprintParseError('AI response is not valid JSON', rawSnippet, sanitizedSnippet)
    }
  }

  if (!parsed.overview || !parsed.overview.summary) {
    throw new BlueprintParseError('AI response missing required overview section', rawSnippet, sanitizedSnippet)
  }

  const overview = {
    summary: parsed.overview.summary,
    mistakes: parsed.overview.mistakes || [],
    guidance: parsed.overview.guidance || []
  }

  const blueprint: AdaptiveBlueprintOutput = { overview }

  if (Array.isArray(parsed.sequential_steps) && parsed.sequential_steps.length > 0) {
    blueprint.sequential_steps = parsed.sequential_steps
  }

  if (Array.isArray(parsed.daily_habits) && parsed.daily_habits.length > 0) {
    blueprint.daily_habits = parsed.daily_habits
  }

  if (Array.isArray(parsed.trigger_actions) && parsed.trigger_actions.length > 0) {
    blueprint.trigger_actions = parsed.trigger_actions
  }

  if (Array.isArray(parsed.decision_checklist) && parsed.decision_checklist.length > 0) {
    blueprint.decision_checklist = parsed.decision_checklist
  }

  if (Array.isArray(parsed.resources) && parsed.resources.length > 0) {
    blueprint.resources = parsed.resources
  }

  if (Array.isArray(parsed.habits) && parsed.habits.length > 0 && !blueprint.daily_habits) {
    blueprint.daily_habits = parsed.habits.map((habit, index) => ({
      id: habit.id ?? index + 1,
      title: habit.title ?? `Step ${index + 1}`,
      description: habit.description ?? '',
      timeframe: habit.timeframe ?? ''
    }))
  }

  return blueprint
}

/**
 * AI Prompts Configuration
 *
 * Base prompt utilities shared across providers.
 */

import type { BlueprintFormData } from '../types/blueprint.js'

export interface PromptConfig {
  systemRole: string
  instructions: string
  outputFormat: string
  constraints: string
}

export const BLUEPRINT_PROMPT_SCHEMA = {
  type: 'object',
  properties: {
    overview: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        mistakes: { type: 'array', items: { type: 'string' } },
        guidance: { type: 'array', items: { type: 'string' } }
      },
      required: ['summary', 'mistakes', 'guidance'],
      additionalProperties: false
    },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          type: {
            type: 'string',
            enum: ['daily_habits', 'sequential_steps', 'troubleshooting', 'decision_checklist', 'resources']
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                timeframe: { type: 'string' },
                step_number: { type: 'number' },
                deliverable: { type: 'string' },
                estimated_time: { type: 'string' },
                problem: { type: 'string' },
                solution: { type: 'string' },
                question: { type: 'string' },
                weight: { type: 'string' },
                name: { type: 'string' },
                type: { type: 'string' }
              },
              required: ['id', 'title', 'description', 'timeframe', 'step_number', 'deliverable', 'estimated_time', 'problem', 'solution', 'question', 'weight', 'name', 'type'],
              additionalProperties: false
            }
          }
        },
        required: ['title', 'description', 'type', 'items'],
        additionalProperties: false
      }
    }
  },
  required: ['overview', 'sections'],
  additionalProperties: false
}

export const BASE_PROMPT_CONFIG: PromptConfig = {
  systemRole: 'You are a habit formation expert. Analyze this content and create a personalized, structured habit blueprint.',
  instructions: `Return **only** a single JSON object with the following structure.
You must analyze the content to identify logical "threads" or "phases" (e.g., "Morning Routine", "Evening Wind-down", "Core Actions", "Emergency Protocols") and group items into titled sections.

Structure:
{
  "overview": { "summary": string, "mistakes": string[], "guidance": string[] },
  "sections": [
    {
      "title": string,
      "description": string,
      "type": "daily_habits" | "sequential_steps" | "troubleshooting" | "decision_checklist" | "resources",
      "items": [ ...items matching the specific type schema below... ]
    }
  ]
}

Item Schemas by Type:
- "daily_habits": { "id": number, "title": string, "description": string, "timeframe": string }
- "sequential_steps": { "step_number": number, "title": string, "description": string, "deliverable": string, "estimated_time": string }
- "troubleshooting": { "problem": string, "solution": string, "description": string }
- "decision_checklist": { "question": string, "weight": string, "description": string }
- "resources": { "name": string, "type": string, "description": string }

Rules:
1. Output MUST be valid JSON.
2. "sections" is an array; multiple sections of the same type are allowed with different titles.
3. Extract specific, actionable items.
4. FLESH OUT every "description" with 1-2 sentences of actionable context.
5. Field guardrails:
   - Use only the properties defined in each type schema.
   - For "sequential_steps", only populate "step_number", "title", "description", "deliverable", "estimated_time".
   - For "decision_checklist", keep "weight" to a short 1-3 word label; put explanations in "description".
6. If you cannot follow the schema, respond with "ERROR_JSON_SCHEMA".`,
  outputFormat: 'Return only valid JSON.',
  constraints: "Make sections distinct and titled meaningfully. Avoid generic titles like 'Habits' when a specific one (e.g. 'Morning Protocol') fits."
}

export function buildBlueprintPrompt(
  formData: BlueprintFormData,
  content: string,
  promptConfig: PromptConfig = BASE_PROMPT_CONFIG
): string {
  const focus = formData.goal?.trim()

  const sections: string[] = [promptConfig.systemRole]

  if (focus) {
    sections.push('', `User Focus: ${focus}`)
  }

  sections.push(
    '',
    `Content: ${content}`,
    '',
    promptConfig.instructions,
    '',
    promptConfig.constraints,
    promptConfig.outputFormat
  )

  return sections.join('\n')
}

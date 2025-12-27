import type { BlueprintFormData } from '../../types/blueprint.js'
import { BLUEPRINT_PROMPT_SCHEMA } from '../prompts.js'

const OPENAI_SYSTEM_PROMPT_HEADER = 'You are a habit formation expert. Analyze this content and create a personalized, structured habit blueprint.'

const OPENAI_SYSTEM_PROMPT_BODY = `Return **only** a single JSON object with the following structure.
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

Example sequential step item (follow this pattern — no placeholders):
"items": [
  {
    "id": 1,
    "step_number": 1,
    "title": "Define the behavior",
    "description": "Specify the exact before→after behavior in one observable context so you can measure it on every rep.",
    "deliverable": "One-sentence behavior statement plus success metric",
    "timeframe": "15 minutes",
    "estimated_time": "15 minutes"
  }
]

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
   - **Do not output placeholder text ("placeholder", "NA", "tbd"). If you lack info, rewrite the item so every field contains meaningful, domain-specific content or omit the field entirely.**
   - For "sequential_steps", provide real values for "step_number", "title", "description", "deliverable", "timeframe", and "estimated_time"; omit optional troubleshooting fields unless they truly apply.
   - For "decision_checklist", keep "weight" to a short 1-3 word label; put explanations in "description".
6. If you cannot follow the schema, respond with "ERROR_JSON_SCHEMA".

Make sections distinct and titled meaningfully. Avoid generic titles like 'Habits' when a specific one (e.g. 'Morning Protocol') fits.`

const OPENAI_SYSTEM_PROMPT = [
  OPENAI_SYSTEM_PROMPT_HEADER,
  '',
  OPENAI_SYSTEM_PROMPT_BODY
].join('\n')

export interface OpenAIPromptSegments {
  system: string
  user: string
}

export const getOpenAIPrompt = (formData: BlueprintFormData, content: string): OpenAIPromptSegments => ({
  system: OPENAI_SYSTEM_PROMPT,
  user: (() => {
    const focus = formData.goal?.trim()
    const segments = [
      'The following user message contains the user focus (optional) and the full transcript you must analyze.'
    ]

    if (focus) {
      segments.push('', `User Focus: ${focus}`)
    }

    segments.push('', 'Transcript:', content)

    return segments.join('\n')
  })()
})

export const OPENAI_GENERATION_FORMAT = {
  model: 'gpt-5-mini',
  text: {
    verbosity: 'medium',
    format: {
      name: 'convergence-blueprint',
      type: 'json_schema' as const,
      schema: BLUEPRINT_PROMPT_SCHEMA,
      json_schema: {
        name: 'Blueprint',
        schema: BLUEPRINT_PROMPT_SCHEMA,
        strict: true
      }
    }
  },
  reasoning: {
    effort: 'medium'
  },
  max_output_tokens: 15024,
  stream: false
}

export const OPENAI_RESPONSE_FORMAT = OPENAI_GENERATION_FORMAT

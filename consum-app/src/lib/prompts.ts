/**
 * AI Prompts Configuration
 * 
 * This file contains all AI prompts used for blueprint generation.
 * Edit these prompts to adjust how the AI analyzes content and generates blueprints.
 */

import type { BlueprintFormData } from '../types/blueprint.js'

export interface PromptConfig {
  systemRole: string
  instructions: string
  outputFormat: string
  constraints: string
}

/**
 * Main blueprint generation prompt configuration
 */
export const BLUEPRINT_PROMPT_CONFIG: PromptConfig = {
  systemRole: "You are a habit formation expert. Analyze this content and create a personalized habit blueprint.",
  
  instructions: `Return **only** a single JSON object with these fields:

{ "overview": { "summary": string, "mistakes": string[], "guidance": string[] },
  "sequential_steps"?: [{ "step_number": number, "title": string, "description": string, "deliverable": string, "estimated_time"?: string }],
  "daily_habits"?: [{ "id": number, "title": string, "description": string, "timeframe": string }],
  "trigger_actions"?: [{ "situation": string, "immediate_action": string, "timeframe": string }],
  "decision_checklist"?: [{ "question": string, "weight"?: string }],
  "resources"?: [{ "name": string, "type": string, "description": string }] }

Rules:
1. Output MUST be valid JSON compliant with the schema above. Do not include Markdown code fences or additional text before/after the object.
2. Every string must use double quotes and escape internal quotes. No trailing commas.
3. If a section has no content, omit the field entirely (do NOT return null).
4. If you cannot follow the schema, respond with the literal string "ERROR_JSON_SCHEMA".`,

  outputFormat: "Return only valid JSON.",

  constraints: "Make habits specific, sequential, and directly related to the user's goal. Never include commentary outside the JSON object."
}



/**
 * AI model generation configuration
 */
export const AI_MODEL_CONFIG = {
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.2,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 10000,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        overview: {
          type: "object",
          properties: {
            summary: { type: "string" },
            mistakes: {
              type: "array",
              items: { type: "string" }
            },
            guidance: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["summary", "mistakes", "guidance"]
        },
        sequential_steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              step_number: { type: "number" },
              title: { type: "string" },
              description: { type: "string" },
              deliverable: { type: "string" },
              estimated_time: { type: "string" }
            },
            required: ["step_number", "title", "description", "deliverable"]
          }
        },
        daily_habits: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number" },
              title: { type: "string" },
              description: { type: "string" },
              timeframe: { type: "string" }
            },
            required: ["id", "title", "description", "timeframe"]
          }
        },
        trigger_actions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              situation: { type: "string" },
              immediate_action: { type: "string" },
              timeframe: { type: "string" }
            },
            required: ["situation", "immediate_action", "timeframe"]
          }
        },
        decision_checklist: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              weight: { type: "string" }
            },
            required: ["question"]
          }
        },
        resources: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string" },
              description: { type: "string" }
            },
            required: ["name", "type", "description"]
          }
        }
      },
      required: ["overview"]
    }
  }
}

/**
 * Build the complete prompt for blueprint generation
 */
export function buildBlueprintPrompt(
  formData: BlueprintFormData,
  content: string
): string {
  const userContext = `User Goal: ${formData.goal}`

  return [
    BLUEPRINT_PROMPT_CONFIG.systemRole,
    '',
    userContext,
    '',
    `Content: ${content}`,
    '',
    BLUEPRINT_PROMPT_CONFIG.instructions,
    '',
    BLUEPRINT_PROMPT_CONFIG.constraints,
    BLUEPRINT_PROMPT_CONFIG.outputFormat
  ].join('\n')
}
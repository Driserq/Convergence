/**
 * AI Prompts Configuration
 * 
 * This file contains all AI prompts used for blueprint generation.
 * Edit these prompts to adjust how the AI analyzes content and generates blueprints.
 */

import type { BlueprintFormData } from '../types/blueprint'

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
  
  instructions: `Generate a JSON response with exactly two sections:

"overview": A single cohesive text block that includes:
- A 2-3 sentence summary of the key insights from the content
- Common mistakes to avoid when implementing these ideas  
- Strategic guidance for success

Use paragraph breaks (\\n\\n) to separate these elements naturally.

"habits": An array of 3-5 actionable habit steps, each with:
- step: number (1, 2, 3, etc.)
- title: short descriptive title
- description: specific, actionable instruction
- timeframe: when to implement (e.g., "Week 1", "Week 1-2")`,

  outputFormat: "Return only valid JSON.",
  
  constraints: "Make habits specific, sequential, and directly related to the user's goal."
}

/**
 * AI model generation configuration
 */
export const AI_MODEL_CONFIG = {
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
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
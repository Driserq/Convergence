import type { BlueprintFormData } from '../../types/blueprint.js'
import { BASE_PROMPT_CONFIG, BLUEPRINT_PROMPT_SCHEMA, buildBlueprintPrompt, type PromptConfig } from '../prompts.js'

export const GEMINI_PROMPT_CONFIG: PromptConfig = BASE_PROMPT_CONFIG

export const GEMINI_GENERATION_CONFIG = {
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 11000,
    responseMimeType: 'application/json',
    responseSchema: BLUEPRINT_PROMPT_SCHEMA
  }
}

export const GEMINI_MODEL_CONFIG = GEMINI_GENERATION_CONFIG

export const getGeminiPrompt = (formData: BlueprintFormData, content: string) =>
  buildBlueprintPrompt(formData, content, GEMINI_PROMPT_CONFIG)

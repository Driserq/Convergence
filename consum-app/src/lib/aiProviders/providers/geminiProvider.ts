import { AiRequestError } from '../../aiClient.js'
import { BlueprintProvider, BlueprintGenerationParams, BlueprintGenerationResult } from '../types.js'
import { GEMINI_MODEL_CONFIG } from '../../prompts/geminiPrompt.js'

interface GeminiProviderOptions {
  apiKey?: string
  model?: string
}

export function createGeminiProvider(options: GeminiProviderOptions): BlueprintProvider {
  const apiKey = options.apiKey || process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY is required for Gemini provider')
  }

  const model = options.model || GEMINI_MODEL_CONFIG.model

  return {
    name: 'gemini',
    model,
    async generateBlueprint(params: BlueprintGenerationParams): Promise<BlueprintGenerationResult> {
      const requestBody = {
        contents: [{
          parts: [{ text: params.prompt }]
        }],
        generationConfig: GEMINI_MODEL_CONFIG.generationConfig
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const raw = await response.text()
        throw new AiRequestError('Gemini request failed', response.status, { rawSnippet: raw })
      }

      const data = await response.json() as any
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        throw new AiRequestError('Gemini response missing content', 500, { rawSnippet: JSON.stringify(data).slice(0, 500) })
      }

      return { rawText: text }
    }
  }
}

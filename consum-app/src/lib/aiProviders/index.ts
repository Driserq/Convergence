import { createGeminiProvider, createOpenAIProvider } from './providers/index.js'
import { BlueprintProvider, BlueprintProviderName } from './types.js'

const resolveProviderName = (override?: string): BlueprintProviderName => {
  const next = (override || process.env.LLM_PROVIDER || 'gemini').toLowerCase()
  if (next === 'openai') return 'openai'
  return 'gemini'
}

export function createBlueprintProvider(override?: string): BlueprintProvider {
  const providerName = resolveProviderName(override)

  switch (providerName) {
    case 'gemini':
      return createGeminiProvider({
        model: process.env.GEMINI_MODEL,
        apiKey: process.env.GOOGLE_AI_API_KEY
      })
    case 'openai':
      return createOpenAIProvider({
        model: process.env.OPENAI_MODEL,
        apiKey: process.env.OPENAI_API_KEY
      })
    default:
      throw new Error(`Unsupported LLM provider: ${providerName}`)
  }
}

export { resolveProviderName }

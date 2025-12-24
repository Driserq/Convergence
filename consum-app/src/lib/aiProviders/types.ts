export interface PromptSegments {
  system: string
  user: string
}

export interface BlueprintGenerationParams {
  prompt: string
  promptSegments?: PromptSegments
}

export type BlueprintProviderName = 'gemini' | 'openai'

export interface BlueprintGenerationResult {
  rawText: string
}

export interface BlueprintProvider {
  name: string
  model: string
  generateBlueprint(params: BlueprintGenerationParams): Promise<BlueprintGenerationResult>
}


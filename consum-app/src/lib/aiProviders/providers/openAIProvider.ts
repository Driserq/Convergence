import { AiRequestError } from '../../aiClient.js'
import { OPENAI_RESPONSE_FORMAT } from '../../prompts/openaiPrompt.js'
import type { BlueprintProvider, BlueprintGenerationParams, BlueprintGenerationResult } from '../types.js'

interface OpenAIProviderOptions {
  apiKey?: string
  model?: string
}

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses'

export function createOpenAIProvider(options: OpenAIProviderOptions): BlueprintProvider {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for OpenAI provider')
  }

  const model = options.model || 'gpt-5-mini'

  return {
    name: 'openai',
    model,
    async generateBlueprint(params: BlueprintGenerationParams): Promise<BlueprintGenerationResult> {
      const requestId = crypto.randomUUID()
      const startedAt = Date.now()
      console.log('[OpenAIProvider] ↗️ Request start', {
        requestId,
        model,
        promptLength: params.prompt.length
      })

      const systemPrompt = params.promptSegments?.system
      const userPrompt = params.promptSegments?.user ?? params.prompt

      const input: Array<{ role: 'system' | 'user'; content: string }> = []
      if (systemPrompt) {
        input.push({ role: 'system', content: systemPrompt })
      }
      input.push({ role: 'user', content: userPrompt })

      const body = {
        model,
        input,
        text: OPENAI_RESPONSE_FORMAT.text,
        reasoning: OPENAI_RESPONSE_FORMAT.reasoning,
        max_output_tokens: OPENAI_RESPONSE_FORMAT.max_output_tokens,
        stream: OPENAI_RESPONSE_FORMAT.stream
      }

      const response = await fetch(OPENAI_RESPONSES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        let errorPayload: any = null
        let raw = ''
        try {
          raw = await response.text()
          errorPayload = raw ? JSON.parse(raw) : null
        } catch {
          // fall back to text
        }

        const message = errorPayload?.error?.message || errorPayload?.message || 'OpenAI request failed'
        const code = errorPayload?.error?.code || errorPayload?.code

        throw new AiRequestError(message, response.status, {
          rawSnippet: raw.slice(0, 500),
          openAIError: errorPayload,
          provider: 'openai',
          providerCode: code
        })
      }

      const data = await response.json() as any
      const elapsedMs = Date.now() - startedAt
      console.log('[OpenAIProvider] ↘️ Response received', {
        requestId,
        model,
        status: data?.status,
        incompleteReason: data?.incomplete_details?.reason,
        elapsedMs
      })

      const text = extractResponseText(data)

      if (!text) {
        const incompleteReason = data?.incomplete_details?.reason
        const status = data?.status

        throw new AiRequestError('OpenAI response missing content', 500, {
          rawSnippet: JSON.stringify({
            status,
            incompleteReason,
            outputPreview: Array.isArray(data?.output) ? data.output.slice(0, 1) : data?.output
          }).slice(0, 500),
          provider: 'openai'
        })
      }

      if (data?.status === 'incomplete') {
        const reason = data?.incomplete_details?.reason
        throw new AiRequestError(`OpenAI response incomplete${reason ? ` (${reason})` : ''}`, 503, {
          rawSnippet: text.slice(0, 500),
          provider: 'openai',
          incompleteReason: reason || 'unknown'
        })
      }

      return { rawText: text }
    }
  }
}

function extractResponseText(data: any): string {
  if (!Array.isArray(data?.output)) {
    return ''
  }

  const chunks: string[] = []

  for (const item of data.output) {
    if (!Array.isArray(item?.content)) continue
    for (const piece of item.content) {
      if (piece?.type === 'output_text' && typeof piece.text === 'string') {
        chunks.push(piece.text)
      } else if (piece?.type === 'output_json_schema' && piece?.json_schema) {
        const payload = piece.json_schema.output ?? piece.json_schema
        chunks.push(typeof payload === 'string' ? payload : JSON.stringify(payload))
      } else if (typeof piece?.text === 'string') {
        chunks.push(piece.text)
      } else if (typeof piece?.output === 'string') {
        chunks.push(piece.output)
      }
    }
  }

  return chunks.join('').trim()
}

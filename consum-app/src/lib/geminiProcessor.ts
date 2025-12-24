import { AiRequestError, generateBlueprintDraft } from './aiClient.js'
import { BlueprintParseError, parseBlueprintResponse } from './blueprintParser.js'
import { classifyError, getErrorCode, getStatusCode } from './aiErrors.js'
import type { ErrorClassification } from './aiErrors.js'
import {
  GeminiRetryJob,
  GeminiRequestData,
  markBlueprintFailed,
  removeRetryJob,
  storeBlueprintResult,
  updateRetryJob
} from './database.js'

const RETRY_DELAYS_SECONDS = [10, 30, 90, 270]

export interface AttemptBlueprintError {
  status: 'error'
  classification: ErrorClassification
  message: string
  statusCode: number | null
  errorCode?: string
  rawSnippet?: string | null
  geminiMeta?: GeminiMeta | null
  error: unknown
}

export type AttemptBlueprintResult = { status: 'success' } | AttemptBlueprintError

interface AttemptBlueprintParams {
  blueprintId: string
  requestData: GeminiRequestData
}

export function computeNextRetrySchedule(currentRetryCount: number): {
  nextRetryCount: number
  delaySeconds: number
  nextRetryAt: string
} | null {
  const nextRetryCount = currentRetryCount + 1
  const delaySeconds = RETRY_DELAYS_SECONDS[nextRetryCount - 1]

  if (!delaySeconds) {
    return null
  }

  return {
    nextRetryCount,
    delaySeconds,
    nextRetryAt: new Date(Date.now() + delaySeconds * 1000).toISOString()
  }
}

export async function attemptBlueprintGeneration({ blueprintId, requestData }: AttemptBlueprintParams): Promise<AttemptBlueprintResult> {
  try {
    const providerName = (requestData.provider || process.env.LLM_PROVIDER || 'gemini').toLowerCase()
    console.log('[LLMProcessor] ▶️ Attempting generation', {
      blueprintId,
      metadata: requestData.metadata,
      provider: providerName
    })
    const result = await callGemini(requestData)
    await storeBlueprintResult(blueprintId, result)
    console.log('[LLMProcessor] ✅ Generation success', { blueprintId, provider: providerName })
    return { status: 'success' }
  } catch (error) {
    const providerName = (requestData.provider || process.env.LLM_PROVIDER || 'gemini').toLowerCase()
    const message = typeof (error as any)?.message === 'string' ? (error as any).message : 'Unknown error'
    console.error('[LLMProcessor] ❌ Generation failed', {
      blueprintId,
      message,
      provider: providerName
    })
    return {
      status: 'error',
      classification: classifyError(error),
      message,
      statusCode: getStatusCode(error),
      errorCode: getErrorCode(error),
      rawSnippet: extractRawSnippet(error),
      geminiMeta: extractGeminiMeta(error),
      error
    }
  }
}

export type ProcessResult =
  | { status: 'success' }
  | { status: 'retry_scheduled'; retryCount: number; nextRetryAt: string }
  | { status: 'failed'; reason: 'max_retries' | 'non_retriable'; errorMessage: string }

export async function processBlueprintJob(job: GeminiRetryJob): Promise<ProcessResult> {
  console.log(`[LLMProcessor] Processing job ${job.id} for blueprint ${job.blueprint_id} (retry #${job.retry_count})`)

  const attempt = await attemptBlueprintGeneration({ blueprintId: job.blueprint_id, requestData: job.request_data })

  if (attempt.status === 'success') {
    await removeRetryJob(job.id)
    console.log(`[LLMProcessor] ✅ Blueprint ${job.blueprint_id} completed successfully`)
    return { status: 'success' }
  }

  return handleProcessingError(job, attempt)
}

export async function callGemini(requestData: GeminiRequestData) {
  const aiText = await generateBlueprintDraft({
    prompt: requestData.prompt,
    promptSegments: requestData.promptSegments,
    providerOverride: requestData.provider
  })
  try {
    return parseBlueprintResponse(aiText)
  } catch (error) {
    if (error instanceof BlueprintParseError) {
      throw new AiRequestError('AI response could not be parsed', 502, {
        type: 'PARSE_ERROR',
        rawSnippet: error.rawSnippet,
        sanitizedSnippet: error.sanitizedSnippet
      })
    }

    throw error
  }
}

async function handleProcessingError(job: GeminiRetryJob, attempt: AttemptBlueprintError): Promise<ProcessResult> {
  const { classification, message, statusCode, errorCode, rawSnippet, geminiMeta } = attempt
  const metaLog = formatGeminiMeta(geminiMeta)

  console.error(
    `[GeminiProcessor] ⚠️ Error processing blueprint ${job.blueprint_id}: ${message} (status=${statusCode ?? 'n/a'}, retry=${job.retry_count})${rawSnippet ? ` | snippet=${rawSnippet}` : ''}${metaLog}`
  )

  if (classification === 'RETRIABLE') {
    const schedule = computeNextRetrySchedule(job.retry_count)

    if (!schedule) {
      await markBlueprintAsFailed(job, message, rawSnippet, geminiMeta)
      return { status: 'failed', reason: 'max_retries', errorMessage: message }
    }

    await updateRetryJob(job.id, {
      retry_count: schedule.nextRetryCount,
      next_retry_at: schedule.nextRetryAt,
      last_error: rawSnippet ? `${message} | snippet=${rawSnippet}` : message,
      error_type: errorCode || String(statusCode ?? 'unknown')
    })

    console.log(
      `[GeminiProcessor] 🔄 Scheduled retry ${schedule.nextRetryCount} for blueprint ${job.blueprint_id} in ${schedule.delaySeconds}s`
    )

    return { status: 'retry_scheduled', retryCount: schedule.nextRetryCount, nextRetryAt: schedule.nextRetryAt }
  }

  await markBlueprintAsFailed(job, message, rawSnippet, geminiMeta)

  return {
    status: 'failed',
    reason: 'non_retriable',
    errorMessage: message
  }
}

async function markBlueprintAsFailed(
  job: GeminiRetryJob,
  message: string,
  rawSnippet?: string | null,
  geminiMeta?: GeminiMeta | null
) {
  await markBlueprintFailed(job.blueprint_id)
  await removeRetryJob(job.id)
  console.error(
    `[GeminiProcessor] ❌ Blueprint ${job.blueprint_id} failed permanently after ${job.retry_count} retries: ${message}${rawSnippet ? ` | snippet=${rawSnippet}` : ''}${formatGeminiMeta(geminiMeta)}`
  )
}

function extractRawSnippet(error: any): string | null {
  if (error instanceof AiRequestError && error.details && typeof error.details === 'object') {
    const snippet = (error.details as Record<string, unknown>).rawSnippet
    if (typeof snippet === 'string' && snippet.trim().length > 0) {
      return snippet.slice(0, 300)
    }
    const sanitized = (error.details as Record<string, unknown>).sanitizedSnippet
    if (typeof sanitized === 'string' && sanitized.trim().length > 0) {
      return sanitized.slice(0, 300)
    }
  }

  if (error instanceof BlueprintParseError) {
    const preferred = error.sanitizedSnippet || error.rawSnippet
    return preferred.slice(0, 300)
  }

  if (typeof error === 'object' && error !== null && 'rawSnippet' in error && typeof (error as any).rawSnippet === 'string') {
    return (error as any).rawSnippet.slice(0, 300)
  }

  return null
}

interface GeminiMeta {
  result?: string
  reason?: string
  message?: string
}

const extractGeminiMeta = (error: any): GeminiMeta | null => {
  if (error instanceof AiRequestError && error.details && typeof error.details === 'object') {
    const details = error.details as Record<string, unknown>
    const result = typeof details.geminiResult === 'string' ? details.geminiResult : undefined
    const reason = typeof details.geminiReason === 'string' ? details.geminiReason : undefined
    const message = typeof details.geminiMessage === 'string' ? details.geminiMessage : undefined

    if (result || reason || message) {
      return { result, reason, message }
    }
  }

  return null
}

const formatGeminiMeta = (meta?: GeminiMeta | null): string => {
  if (!meta) return ''
  const parts: string[] = []
  if (meta.result) parts.push(`result=${meta.result}`)
  if (meta.reason) parts.push(`reason=${meta.reason}`)
  if (meta.message) parts.push(`message=${meta.message}`)
  return parts.length ? ` | ${parts.join(' ')}` : ''
}

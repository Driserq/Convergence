import { AiRequestError, generateBlueprintDraft } from './aiClient'
import { BlueprintParseError, parseBlueprintResponse } from './blueprintParser'
import { classifyError, getErrorCode, getStatusCode } from './aiErrors'
import {
  GeminiRetryJob,
  GeminiRequestData,
  markBlueprintFailed,
  removeRetryJob,
  storeBlueprintResult,
  updateRetryJob
} from './database'

const RETRY_DELAYS_SECONDS = [10, 30, 90, 270]

export type ProcessResult =
  | { status: 'success' }
  | { status: 'retry_scheduled'; retryCount: number; nextRetryAt: string }
  | { status: 'failed'; reason: 'max_retries' | 'non_retriable'; errorMessage: string }

export async function processBlueprintJob(job: GeminiRetryJob): Promise<ProcessResult> {
  console.log(`[GeminiProcessor] Processing job ${job.id} for blueprint ${job.blueprint_id} (retry #${job.retry_count})`)

  try {
    const result = await callGemini(job.request_data)
    await storeBlueprintResult(job.blueprint_id, result)
    await removeRetryJob(job.id)
    console.log(`[GeminiProcessor] ✅ Blueprint ${job.blueprint_id} completed successfully`)
    return { status: 'success' }
  } catch (error: any) {
    return handleProcessingError(job, error)
  }
}

export async function callGemini(requestData: GeminiRequestData) {
  const aiText = await generateBlueprintDraft({ prompt: requestData.prompt })
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

async function handleProcessingError(job: GeminiRetryJob, error: any): Promise<ProcessResult> {
  const classification = classifyError(error)
  const message = typeof error?.message === 'string' ? error.message : 'Unknown error'
  const statusCode = getStatusCode(error)
  const errorCode = getErrorCode(error)
  const rawSnippet = extractRawSnippet(error)
  const geminiMeta = extractGeminiMeta(error)
  const metaLog = formatGeminiMeta(geminiMeta)

  console.error(
    `[GeminiProcessor] ⚠️ Error processing blueprint ${job.blueprint_id}: ${message} (status=${statusCode ?? 'n/a'}, retry=${job.retry_count})${rawSnippet ? ` | snippet=${rawSnippet}` : ''}${metaLog}`
  )

  if (classification === 'RETRIABLE') {
    const newRetryCount = job.retry_count + 1

    if (newRetryCount > RETRY_DELAYS_SECONDS.length) {
      await markBlueprintAsFailed(job, message, rawSnippet, geminiMeta)
      return { status: 'failed', reason: 'max_retries', errorMessage: message }
    }

    const delaySeconds = RETRY_DELAYS_SECONDS[newRetryCount - 1]
    const nextRetryAt = new Date(Date.now() + delaySeconds * 1000).toISOString()

    await updateRetryJob(job.id, {
      retry_count: newRetryCount,
      next_retry_at: nextRetryAt,
      last_error: rawSnippet ? `${message} | snippet=${rawSnippet}` : message,
      error_type: errorCode || String(statusCode ?? 'unknown')
    })

    console.log(
      `[GeminiProcessor] 🔄 Scheduled retry ${newRetryCount} for blueprint ${job.blueprint_id} in ${delaySeconds}s`
    )

    return { status: 'retry_scheduled', retryCount: newRetryCount, nextRetryAt }
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

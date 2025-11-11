import { AiRequestError } from './aiClient'

export type ErrorClassification = 'RETRIABLE' | 'NON_RETRIABLE'

const RETRIABLE_STATUS_CODES = new Set([429, 500, 502, 503])
const NON_RETRIABLE_STATUS_CODES = new Set([400, 401, 403, 404])

export function classifyError(error: unknown): ErrorClassification {
  const status = getStatusCode(error)

  if (status !== null) {
    if (NON_RETRIABLE_STATUS_CODES.has(status)) {
      return 'NON_RETRIABLE'
    }

    if (RETRIABLE_STATUS_CODES.has(status)) {
      return 'RETRIABLE'
    }
  }

  if (isTimeoutError(error)) {
    return 'RETRIABLE'
  }

  return 'NON_RETRIABLE'
}

export function isRetriable(error: unknown): boolean {
  return classifyError(error) === 'RETRIABLE'
}

export function getStatusCode(error: unknown): number | null {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const value = (error as any).status
    if (typeof value === 'number') {
      return value
    }
  }

  if (error instanceof AiRequestError) {
    return error.statusCode
  }

  return null
}

export function getErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const value = (error as any).code
    if (typeof value === 'string') {
      return value
    }
  }

  if (error instanceof AiRequestError) {
    const details = error.details as Record<string, unknown> | undefined
    const status = details && typeof details === 'object' && 'error' in details ? (details as any).error : undefined
    if (status && typeof status === 'object' && status !== null && 'status' in status) {
      const innerStatus = (status as any).status
      if (typeof innerStatus === 'string') {
        return innerStatus
      }
    }
  }

  return undefined
}

function isTimeoutError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof (error as any).message === 'string') {
      const message = (error as any).message.toLowerCase()
      if (message.includes('timeout')) {
        return true
      }
    }

    if ('code' in error && typeof (error as any).code === 'string') {
      const code = (error as any).code
      return code === 'ETIMEDOUT' || code === 'ECONNRESET'
    }
  }

  return false
}

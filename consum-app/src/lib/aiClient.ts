import { createBlueprintProvider } from './aiProviders/index.js';
import type { BlueprintProviderName, PromptSegments } from './aiProviders/types.js';

export class AiRequestError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'AiRequestError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

interface GenerateBlueprintOptions {
  prompt: string
  promptSegments?: PromptSegments
  providerOverride?: BlueprintProviderName
}

const MAX_ERROR_LOG_LENGTH = 300;

interface GeminiErrorMeta {
  result?: string
  reason?: string
  message?: string
}

const truncateForLog = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  if (value.length <= MAX_ERROR_LOG_LENGTH) {
    return value;
  }
  return `${value.slice(0, MAX_ERROR_LOG_LENGTH)}…`;
};

const extractGeminiErrorMessage = (details: unknown): string | null => {
  if (!details) return null;
  if (typeof details === 'string') {
    return details.trim() || null;
  }

  if (typeof details === 'object') {
    const payload = details as Record<string, unknown>;
    const errorSection = payload.error as Record<string, unknown> | undefined;

    if (errorSection && typeof errorSection.message === 'string') {
      return errorSection.message;
    }

    if (typeof payload.message === 'string') {
      return payload.message;
    }

    if (Array.isArray(errorSection?.details)) {
      for (const entry of errorSection!.details as unknown[]) {
        if (entry && typeof entry === 'object' && 'message' in entry && typeof (entry as any).message === 'string') {
          return (entry as any).message;
        }
      }
    }

    try {
      return JSON.stringify(payload);
    } catch {
      return null;
    }
  }

  return null;
};

const extractGeminiErrorCode = (details: unknown): string | undefined => {
  if (!details || typeof details !== 'object') {
    return undefined;
  }

  const payload = details as Record<string, unknown>;
  const errorSection = payload.error as Record<string, unknown> | undefined;

  if (errorSection && typeof errorSection.code === 'string') {
    return errorSection.code;
  }

  if (typeof payload.code === 'string') {
    return payload.code;
  }

  return undefined;
};

const extractGeminiErrorMeta = (details: unknown): GeminiErrorMeta => {
  if (!details || typeof details !== 'object') {
    return {};
  }

  const payload = details as Record<string, unknown>;
  const errorSection = payload.error as Record<string, unknown> | undefined;

  const result = typeof payload.result === 'string'
    ? payload.result
    : typeof errorSection?.status === 'string'
      ? errorSection.status
      : typeof errorSection?.code === 'string'
        ? errorSection.code
        : undefined;

  const reason = typeof payload.reason === 'string'
    ? payload.reason
    : typeof errorSection?.reason === 'string'
      ? errorSection.reason
      : typeof errorSection?.status === 'string'
        ? errorSection.status
        : undefined;

  const message = typeof payload.message === 'string'
    ? payload.message
    : typeof errorSection?.message === 'string'
      ? errorSection.message
      : undefined;

  return { result, reason, message };
};

const readGeminiErrorBody = async (response: Response) => {
  let parsedDetails: unknown = null;
  let preview: string | undefined;

  try {
    const rawBody = await response.text();
    if (rawBody) {
      try {
        parsedDetails = JSON.parse(rawBody);
        preview = truncateForLog(safeStringify(parsedDetails));
      } catch {
        parsedDetails = rawBody;
        preview = truncateForLog(rawBody);
      }
    }
  } catch (bodyError) {
    console.warn('[AIClient] Failed to read Gemini error body:', bodyError);
  }

  return { parsedDetails, preview };
};

const safeStringify = (value: unknown): string => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return '[unserializable]';
  }
};

const decorateGeminiDetails = (details: unknown, preview?: string) => {
  const meta = extractGeminiErrorMeta(details)
  return {
    rawSnippet: preview,
    payload: details,
    geminiResult: meta.result,
    geminiReason: meta.reason,
    geminiMessage: meta.message
  }
}

export async function generateBlueprintDraft({ prompt, promptSegments, providerOverride }: GenerateBlueprintOptions): Promise<string> {
  const forcedFailure = process.env.GEMINI_FORCE_FAILURE?.trim().toLowerCase();
  if (forcedFailure && forcedFailure !== 'off') {
    if (forcedFailure === 'timeout') {
      throw new AiRequestError('Forced Gemini timeout for testing', 503, {
        code: 'ETIMEDOUT',
        message: 'Forced Gemini timeout for testing'
      });
    }

    const maybeStatus = Number.parseInt(forcedFailure, 10);
    if (!Number.isNaN(maybeStatus)) {
      const statusCode = maybeStatus;
      const defaultMessages: Record<number, string> = {
        400: 'Forced Gemini bad request for testing',
        401: 'Forced Gemini unauthorized for testing',
        403: 'Forced Gemini forbidden for testing',
        404: 'Forced Gemini not found for testing',
        429: 'Forced Gemini rate limit for testing',
        500: 'Forced Gemini internal error for testing',
        502: 'Forced Gemini bad gateway for testing',
        503: 'Forced Gemini service unavailable for testing'
      };

      throw new AiRequestError(
        defaultMessages[statusCode] || 'Forced Gemini failure for testing',
        statusCode,
        { code: `FORCED_${statusCode}`, message: 'Forced Gemini failure for testing' }
      );
    }

    console.warn('[AIClient] GEMINI_FORCE_FAILURE provided but not recognized:', forcedFailure);
  }

  const provider = createBlueprintProvider(providerOverride);
  console.log('[AIClient] Using provider', provider.name, 'model', provider.model);

  try {
    const result = await provider.generateBlueprint({ prompt, promptSegments });
    return result.rawText;
  } catch (error: any) {
    if (error instanceof AiRequestError) {
      throw error;
    }
    console.error('[AIClient] Provider error', error);
    throw new AiRequestError('AI service temporarily unavailable', 503, { rawSnippet: String(error) });
  }
}


import { AI_MODEL_CONFIG } from './prompts';

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
  prompt: string;
}

export async function generateBlueprintDraft({ prompt }: GenerateBlueprintOptions): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new AiRequestError('AI service temporarily unavailable', 503);
  }

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

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: AI_MODEL_CONFIG.generationConfig
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL_CONFIG.model}:generateContent?key=${apiKey}`;

  console.log('[AIClient] Requesting blueprint generation with model:', AI_MODEL_CONFIG.model);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    let details: unknown;

    try {
      details = await response.json();
    } catch {
      try {
        details = await response.text();
      } catch {
        details = null;
      }
    }

    const statusCode = response.status === 429 ? 429 : 503;
    const message = statusCode === 429
      ? 'AI service rate limit exceeded. Please try again in a moment.'
      : 'AI service temporarily unavailable';

    throw new AiRequestError(message, statusCode, details);
  }

  const data = await response.json() as any;
  const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!aiText) {
    throw new AiRequestError('AI failed to generate blueprint', 500, data);
  }

  return aiText;
}

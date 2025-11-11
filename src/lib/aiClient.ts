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

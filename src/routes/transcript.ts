// Fastify route for transcript extraction

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { extractTranscript, transcriptErrorToStatus, validateTranscriptService } from '../lib/transcript.js';
import { TranscriptServiceRequest } from '../types/transcript.js';
import { validateYouTubeUrl } from '../lib/validation.js';

// Request body validation schema
const transcriptRequestSchema = z.object({
  youtubeUrl: z.string().min(1, 'YouTube URL is required')
});

type TranscriptRequestBody = z.infer<typeof transcriptRequestSchema>;

/**
 * Registers transcript-related API routes
 */
export default async function transcriptRoutes(fastify: FastifyInstance) {
  
  // POST /api/transcript - Extract transcript from YouTube URL
  fastify.post<{ Body: TranscriptRequestBody }>(
    '/api/transcript', 
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            youtubeUrl: { type: 'string' }
          },
          required: ['youtubeUrl']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              transcript: { type: 'string' },
              language: { type: 'string' },
              metadata: {
                type: 'object',
                properties: {
                  videoId: { type: 'string' },
                  originalUrl: { type: 'string' },
                  textLength: { type: 'number' },
                  estimatedDuration: { type: 'number' }
                }
              }
            }
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                  details: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: TranscriptRequestBody }>, reply: FastifyReply) => {
      try {
        console.log('[TranscriptAPI] Received transcript request');
        
        // Validate request body
        const validation = transcriptRequestSchema.safeParse(request.body);
        if (!validation.success) {
          console.error('[TranscriptAPI] Invalid request body:', validation.error.flatten());
          return reply.code(400).send({
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: 'Invalid YouTube URL provided',
              details: validation.error.issues.map(i => i.message).join(', ')
            }
          });
        }

        const { youtubeUrl } = validation.data;
        
        // Additional YouTube URL validation using helper
        const urlValidation = validateYouTubeUrl(youtubeUrl);
        if (!urlValidation.isValid) {
          console.error('[TranscriptAPI] Invalid YouTube URL:', urlValidation.error);
          return reply.code(400).send({
            success: false,
            error: {
              code: 'INVALID_URL',
              message: urlValidation.error!,
              details: 'YouTube URL validation failed'
            }
          });
        }
        
        console.log('[TranscriptAPI] Processing URL:', youtubeUrl);

        // Check if transcript service is properly configured
        const serviceValidation = validateTranscriptService();
        if (!serviceValidation.configured) {
          console.error('[TranscriptAPI] Service not configured:', serviceValidation.error);
          return reply.code(503).send({
            success: false,
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Transcript service is temporarily unavailable',
              details: serviceValidation.error
            }
          });
        }

        // Extract transcript
        const transcriptRequest: TranscriptServiceRequest = { youtubeUrl };
        const result = await extractTranscript(transcriptRequest);

        if (!result.success) {
          console.log('[TranscriptAPI] Transcript extraction failed:', result.error);
          // Return appropriate HTTP status based on error type
          const statusCode = transcriptErrorToStatus(result.error!.code);
          return reply.code(statusCode).send(result);
        }

        console.log(`[TranscriptAPI] Successfully extracted transcript (${result.transcript?.length} chars)`);
        return reply.send(result);

      } catch (error) {
        console.error('[TranscriptAPI] Unexpected error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
            details: error instanceof Error ? error.message : String(error)
          }
        });
      }
    }
  );

  // GET /api/transcript/health - Health check for transcript service
  fastify.get('/api/transcript/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validation = validateTranscriptService();
      
      if (validation.configured) {
        return reply.send({
          status: 'healthy',
          service: 'transcript',
          configured: true
        });
      } else {
        return reply.code(503).send({
          status: 'unavailable',
          service: 'transcript', 
          configured: false,
          error: validation.error
        });
      }
    } catch (error) {
      console.error('[TranscriptAPI] Health check error:', error);
      return reply.code(500).send({
        status: 'error',
        service: 'transcript',
        configured: false,
        error: 'Health check failed'
      });
    }
  });
}
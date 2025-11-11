// Single endpoint for complete blueprint creation pipeline
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { blueprintFormSchema } from '../lib/validation';
import { buildBlueprintPrompt } from '../lib/prompts';
import {
  createPendingBlueprint,
  enqueueRetryJob,
  getServiceClient,
  markBlueprintFailed,
  type GeminiRequestData
} from '../lib/database';
import { supabase } from '../lib/supabase.server';
import { extractTranscript, transcriptErrorToStatus, validateTranscriptService } from '../lib/transcript';
import { processBlueprintJob } from '../lib/geminiProcessor';
import type { BlueprintFormData, ContentType, BlueprintStatus } from '../types/blueprint';

// Request validation schema
const createBlueprintSchema = blueprintFormSchema;

interface BlueprintResponse {
  success: boolean;
  blueprintId?: string;
  status?: BlueprintStatus;
  savedBlueprint?: {
    id: string;
    user_id: string;
    goal: string;
    content_source: string;
    content_type: ContentType;
    status: BlueprintStatus;
    created_at: string;
  };
  metadata?: {
    contentType: 'youtube' | 'text';
    url?: string;
    videoId?: string;
    transcriptLength?: number;
    language?: string;
  };
  error?: string;
}

export default async function blueprintRoutes(fastify: FastifyInstance) {
  
  // GET /api/blueprints - Fetch user's blueprints
  fastify.get('/api/blueprints', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log('[GetBlueprints] Fetching blueprints for user');
      
      // Extract and verify authenticated user
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('[GetBlueprints] Missing or invalid authorization header');
        return reply.code(401).send({
          success: false,
          error: 'Authentication required. Please log in.'
        });
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      // Verify the JWT token and get user
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error('[GetBlueprints] Invalid or expired token:', authError?.message);
        return reply.code(401).send({
          success: false,
          error: 'Invalid or expired session. Please log in again.'
        });
      }
      
      console.log('[GetBlueprints] Fetching blueprints for user:', user.email);
      
      // Use service client to bypass RLS (consistent with POST endpoint)
      const serviceClient = getServiceClient();
      
      // Fetch blueprints from database
      const { data: blueprints, error: dbError } = await serviceClient
        .from('habit_blueprints')
        .select('id, goal, content_source, content_type, ai_output, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (dbError) {
        console.error('[GetBlueprints] Database error:', dbError);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch blueprints'
        });
      }
      
      console.log(`[GetBlueprints] ✅ Found ${blueprints?.length || 0} blueprints`);
      
      return reply.send({
        success: true,
        blueprints: blueprints || []
      });
      
    } catch (error) {
      console.error('[GetBlueprints] Unexpected error:', error);
      return reply.code(500).send({
        success: false,
        error: 'An unexpected error occurred while fetching blueprints'
      });
    }
  });
  
  // POST /api/create-blueprint - Complete blueprint creation pipeline
  fastify.post<{ Body: BlueprintFormData }>(
    '/api/create-blueprint',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            goal: { type: 'string' },
            contentType: { type: 'string', enum: ['youtube', 'text'] },
            youtubeUrl: { type: 'string' },
            textContent: { type: 'string' }
          },
          required: ['goal', 'contentType']
        }
      }
    },
    async (request: FastifyRequest<{ Body: BlueprintFormData }>, reply: FastifyReply) => {
      try {
        console.log('[CreateBlueprint] Starting blueprint creation pipeline');
        
        // 1. Extract and verify authenticated user
        const authHeader = request.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          console.error('[CreateBlueprint] Missing or invalid authorization header');
          return reply.code(401).send({
            success: false,
            error: 'Authentication required. Please log in.'
          } as BlueprintResponse);
        }
        
        const token = authHeader.replace('Bearer ', '');
        
        // Verify the JWT token and get user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
          console.error('[CreateBlueprint] Invalid or expired token:', authError?.message);
          return reply.code(401).send({
            success: false,
            error: 'Invalid or expired session. Please log in again.'
          } as BlueprintResponse);
        }
        
        console.log('[CreateBlueprint] Authenticated user:', user.email, 'ID:', user.id);
        
        // 2. Validate request body
        const validation = createBlueprintSchema.safeParse(request.body);
        if (!validation.success) {
          console.error('[CreateBlueprint] Validation failed:', validation.error.flatten());
          return reply.code(400).send({
            success: false,
            error: 'Invalid request data: ' + validation.error.issues.map(i => i.message).join(', ')
          } as BlueprintResponse);
        }

        const formData = validation.data;
        let content: string;
        let metadata: BlueprintResponse['metadata'];

        // 2. Extract content based on type
        if (formData.contentType === 'youtube') {
          console.log('[CreateBlueprint] Extracting YouTube transcript...');

          if (!formData.youtubeUrl) {
            return reply.code(400).send({
              success: false,
              error: 'YouTube URL is required for transcript extraction'
            } as BlueprintResponse);
          }

          const transcriptService = validateTranscriptService();
          if (!transcriptService.configured) {
            console.error('[CreateBlueprint] Transcript service not configured:', transcriptService.error);
            return reply.code(503).send({
              success: false,
              error: 'Transcript service temporarily unavailable'
            } as BlueprintResponse);
          }

          const transcriptResult = await extractTranscript({ youtubeUrl: formData.youtubeUrl });
          if (!transcriptResult.success || !transcriptResult.transcript) {
            const errorInfo = transcriptResult.error;
            const statusCode = errorInfo ? transcriptErrorToStatus(errorInfo.code) : 500;

            console.error('[CreateBlueprint] Transcript extraction failed:', errorInfo?.code, errorInfo?.message);

            return reply.code(statusCode).send({
              success: false,
              error: errorInfo?.message ?? 'Transcript extraction failed'
            } as BlueprintResponse);
          }

          content = transcriptResult.transcript.trim();

          if (content.length < 10) {
            console.error('[CreateBlueprint] Transcript too short:', content.length, 'characters');
            return reply.code(404).send({
              success: false,
              error: 'No transcript available for this video'
            } as BlueprintResponse);
          }

          metadata = {
            contentType: 'youtube',
            url: formData.youtubeUrl,
            videoId: transcriptResult.metadata?.videoId,
            transcriptLength: transcriptResult.metadata?.textLength ?? content.length,
            language: transcriptResult.language || 'en'
          };

          console.log(`[CreateBlueprint] ✅ Transcript extracted: ${content.length} characters`);
          console.log('[CreateBlueprint] First 500 chars of transcript:', content.substring(0, 500));

        } else {
          // Use text content directly
          content = formData.textContent.trim();
          metadata = {
            contentType: 'text'
          };
          console.log(`[CreateBlueprint] Using text content: ${content.length} characters`);
        }

        // 3. Create prompt and queue Gemini request
        console.log('[CreateBlueprint] Preparing Gemini request...');
        console.log(`[CreateBlueprint] 📝 Prompt will use ${content.length} characters of source content`);
        console.log('[CreateBlueprint] Content preview:', content.substring(0, 300));

        const prompt = buildBlueprintPrompt(formData, content);

        const requestData: GeminiRequestData = {
          prompt,
          metadata: {
            userId: user.id,
            goal: formData.goal,
            contentType: formData.contentType,
            source: metadata?.contentType,
            sourceUrl: metadata?.url
          }
        };

        const contentSource = formData.contentType === 'youtube'
          ? (metadata?.url || formData.youtubeUrl)
          : 'Text Input';

        console.log('[CreateBlueprint] Creating pending blueprint record...');

        let pendingBlueprint;
        try {
          pendingBlueprint = await createPendingBlueprint({
            userId: user.id,
            goal: formData.goal,
            contentSource,
            contentType: formData.contentType
          });
        } catch (dbError: any) {
          console.error('[CreateBlueprint] Failed to create pending blueprint:', dbError);
          return reply.code(500).send({
            success: false,
            error: 'Failed to queue blueprint generation'
          } as BlueprintResponse);
        }

        let retryJob;
        try {
          retryJob = await enqueueRetryJob(pendingBlueprint.id, requestData);
        } catch (queueError: any) {
          console.error('[CreateBlueprint] Failed to enqueue Gemini retry job:', queueError);
          try {
            await markBlueprintFailed(pendingBlueprint.id);
          } catch (markError) {
            console.error('[CreateBlueprint] Failed to mark blueprint as failed after queue error:', markError);
          }
          return reply.code(500).send({
            success: false,
            error: 'Failed to start blueprint generation'
          } as BlueprintResponse);
        }

        setImmediate(() => {
          processBlueprintJob(retryJob).catch((error) => {
            console.error(`[CreateBlueprint] Background processing error for blueprint ${retryJob.blueprint_id}:`, error);
          });
        });

        console.warn('[CreateBlueprint] Blueprint queued for background processing', {
          blueprintId: pendingBlueprint.id,
          retryJobId: retryJob.id
        });

        return reply.code(202).send({
          success: true,
          blueprintId: pendingBlueprint.id,
          status: pendingBlueprint.status,
          savedBlueprint: {
            id: pendingBlueprint.id,
            user_id: pendingBlueprint.user_id,
            goal: pendingBlueprint.goal,
            content_source: pendingBlueprint.content_source,
            content_type: pendingBlueprint.content_type,
            status: pendingBlueprint.status,
            created_at: pendingBlueprint.created_at
          },
          metadata
        } as BlueprintResponse);

      } catch (error) {
        console.error('[CreateBlueprint] Unexpected error:', error);
        return reply.code(500).send({
          success: false,
          error: 'An unexpected error occurred while creating blueprint'
        } as BlueprintResponse);
      }
    }
  );
}

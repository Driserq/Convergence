// Single endpoint for complete blueprint creation pipeline
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { blueprintFormSchema } from '../lib/validation';
import { buildBlueprintPrompt } from '../lib/prompts';
import { saveBlueprintToDatabase, getServiceClient } from '../lib/database';
import { supabase } from '../lib/supabase.server';
import { extractTranscript, transcriptErrorToStatus, validateTranscriptService } from '../lib/transcript';
import { AiRequestError, generateBlueprintDraft } from '../lib/aiClient';
import type { BlueprintFormData, ContentType } from '../types/blueprint';

// Request validation schema
const createBlueprintSchema = blueprintFormSchema;

interface BlueprintResponse {
  success: boolean;
  blueprint?: {
    overview: {
      summary: string;
      mistakes: string[];
      guidance: string[];
    };
    sequential_steps?: Array<{
      step_number: number;
      title: string;
      description: string;
      deliverable: string;
      estimated_time?: string;
    }>;
    daily_habits?: Array<{
      id: number;
      title: string;
      description: string;
      timeframe: string;
    }>;
    trigger_actions?: Array<{
      situation: string;
      immediate_action: string;
      timeframe: string;
    }>;
    decision_checklist?: Array<{
      question: string;
      weight?: string;
    }>;
    resources?: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  };
  savedBlueprint?: {
    id: string;
    user_id: string;
    goal: string;
    content_source: string;
    content_type: ContentType;
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
        .select('id, goal, content_source, content_type, ai_output, created_at')
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

        // 3. Generate blueprint with AI
        console.log('[CreateBlueprint] Generating blueprint with AI...');

        // Construct AI prompt using external configuration
        console.log(`[CreateBlueprint] 📝 Preparing AI prompt with ${content.length} characters of content`);
        console.log('[CreateBlueprint] Content preview:', content.substring(0, 300));
        
        const prompt = buildBlueprintPrompt(formData, content);

        let aiText: string;

        try {
          aiText = await generateBlueprintDraft({ prompt });
        } catch (error) {
          if (error instanceof AiRequestError) {
            console.error('[CreateBlueprint] AI request failed:', error.details ?? error.message);
            return reply.code(error.statusCode).send({
              success: false,
              error: error.message
            } as BlueprintResponse);
          }

          console.error('[CreateBlueprint] Unexpected AI error:', error);
          return reply.code(500).send({
            success: false,
            error: 'AI service temporarily unavailable'
          } as BlueprintResponse);
        }

        console.log('[CreateBlueprint] ✅ AI response received, length:', aiText.length);
        console.log('[CreateBlueprint] AI response preview:', aiText.substring(0, 300));

        // Parse structured AI response (responseSchema guarantees valid JSON)
        let blueprint;
        try {
          // With responseSchema, aiText is already valid JSON without markdown wrapping
          const parsed = JSON.parse(aiText);
          
          // Validate required overview section
          if (!parsed.overview || !parsed.overview.summary) {
            throw new Error('AI response missing required overview section');
          }
          
          // Use adaptive blueprint structure directly
          blueprint = {
            overview: {
              summary: parsed.overview.summary,
              mistakes: parsed.overview.mistakes || [],
              guidance: parsed.overview.guidance || []
            },
            // Include optional sections only if populated by AI
            ...(parsed.sequential_steps && parsed.sequential_steps.length > 0 && {
              sequential_steps: parsed.sequential_steps
            }),
            ...(parsed.daily_habits && parsed.daily_habits.length > 0 && {
              daily_habits: parsed.daily_habits
            }),
            ...(parsed.trigger_actions && parsed.trigger_actions.length > 0 && {
              trigger_actions: parsed.trigger_actions
            }),
            ...(parsed.decision_checklist && parsed.decision_checklist.length > 0 && {
              decision_checklist: parsed.decision_checklist
            }),
            ...(parsed.resources && parsed.resources.length > 0 && {
              resources: parsed.resources
            })
          };
          
          console.log('[CreateBlueprint] ✅ Adaptive blueprint parsed successfully');
          console.log('[CreateBlueprint] Blueprint sections:', Object.keys(blueprint));
          
        } catch (parseError) {
          console.error('[CreateBlueprint] Failed to parse structured AI response:', parseError);
          console.error('[CreateBlueprint] AI response:', aiText);
          return reply.code(500).send({
            success: false,
            error: 'Failed to process AI-generated blueprint'
          } as BlueprintResponse);
        }

        // 4. Save to database
        console.log('[CreateBlueprint] Saving blueprint to database...');
        
        const saveResult = await saveBlueprintToDatabase({
          userId: user.id,
          goal: formData.goal,
          contentSource: formData.contentType === 'youtube' 
            ? (metadata.url || formData.youtubeUrl) 
            : 'Text Input',
          contentType: formData.contentType,
          aiOutput: blueprint
        });
        
        if (!saveResult.success) {
          console.error('[CreateBlueprint] Failed to save to database:', saveResult.error);
          // Don't fail the request - return the blueprint anyway
          // This ensures users still get their generated blueprint even if database save fails
        } else {
          console.log('[CreateBlueprint] ✅ Blueprint saved to database with ID:', saveResult.data?.id);
        }

        // 5. Return complete blueprint with database info
        return reply.send({
          success: true,
          blueprint,
          savedBlueprint: saveResult.success && saveResult.data ? {
            id: saveResult.data.id,
            user_id: saveResult.data.user_id,
            goal: saveResult.data.goal,
            content_source: saveResult.data.content_source,
            content_type: saveResult.data.content_type,
            created_at: saveResult.data.created_at
          } : undefined,
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

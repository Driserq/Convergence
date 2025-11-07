// Single endpoint for complete blueprint creation pipeline
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { extractYouTubeVideoId } from '../lib/youtube';
import { blueprintFormSchema } from '../lib/validation';
import { buildBlueprintPrompt, GEMINI_CONFIG } from '../lib/prompts';
import { saveBlueprintToDatabase, getServiceClient } from '../lib/database';
import { supabase } from '../lib/supabase.server';
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
            habitsToKill: { type: 'string' },
            habitsToDevelop: { type: 'string' },
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
          
          console.log('[CreateBlueprint] Processing YouTube URL:', formData.youtubeUrl);
          
          // Validate YouTube URL format
          if (!formData.youtubeUrl || !formData.youtubeUrl.includes('youtube')) {
            return reply.code(400).send({
              success: false,
              error: 'Invalid YouTube URL format'
            } as BlueprintResponse);
          }

          // Check Supadata API key
          const supadata_api_key = process.env.SUPADATA_API_KEY;
          if (!supadata_api_key) {
            console.error('[CreateBlueprint] SUPADATA_API_KEY not configured');
            return reply.code(503).send({
              success: false,
              error: 'Transcript service temporarily unavailable'
            } as BlueprintResponse);
          }
          
          console.log('[CreateBlueprint] Calling Supadata API...');
          console.log('[CreateBlueprint] API Key present:', !!supadata_api_key);
          console.log('[CreateBlueprint] Full YouTube URL:', formData.youtubeUrl);

          // Extract video ID and rebuild a clean YouTube URL
          const videoId = extractYouTubeVideoId(formData.youtubeUrl);
          const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
          
          // Call Supadata API with correct GET request and query parameters
          const apiUrl = `https://api.supadata.ai/v1/transcript?url=${encodeURIComponent(cleanUrl)}&lang=en&text=true&mode=auto`;
          console.log('[CreateBlueprint] Supadata request URL:', apiUrl);
          
          const transcriptResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'x-api-key': supadata_api_key
            }
          });

          // Handle both immediate (200) and async (202) responses
          let transcriptData;
          
          if (transcriptResponse.status === 200) {
            // Immediate response - transcript ready
            console.log('[CreateBlueprint] ✅ Immediate transcript response');
            transcriptData = await transcriptResponse.json();
            
          } else if (transcriptResponse.status === 202) {
            // Async job - poll for results
            console.log('[CreateBlueprint] 🔄 Async job created, polling for results...');
            const jobResponse = await transcriptResponse.json() as any;
            const jobId = jobResponse.jobId;
            
            if (!jobId) {
              console.error('[CreateBlueprint] No jobId in 202 response');
              return reply.code(500).send({
                success: false,
                error: 'Failed to create transcript job'
              } as BlueprintResponse);
            }
            
            console.log('[CreateBlueprint] Job ID:', jobId);
            
            // Poll job status (max 30 attempts = 30 seconds)
            let attempts = 0;
            const maxAttempts = 30;
            
            while (attempts < maxAttempts) {
              attempts++;
              console.log(`[CreateBlueprint] Polling attempt ${attempts}/${maxAttempts}...`);
              
              // Wait 1 second before polling
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              const jobStatusResponse = await fetch(`https://api.supadata.ai/v1/transcript/${jobId}`, {
                method: 'GET',
                headers: {
                  'x-api-key': supadata_api_key
                }
              });
              
              if (!jobStatusResponse.ok) {
                console.error(`[CreateBlueprint] Job status check failed: ${jobStatusResponse.status}`);
                continue;
              }
              
              const jobStatus = await jobStatusResponse.json() as any;
              console.log(`[CreateBlueprint] Job status: ${jobStatus.status}`);
              
              if (jobStatus.status === 'completed') {
                console.log('[CreateBlueprint] ✅ Job completed successfully');
                transcriptData = jobStatus.result;
                break;
              } else if (jobStatus.status === 'failed') {
                console.error('[CreateBlueprint] ❌ Job failed:', jobStatus.error || 'Unknown error');
                return reply.code(500).send({
                  success: false,
                  error: 'Transcript generation failed: ' + (jobStatus.error || 'Unknown error')
                } as BlueprintResponse);
              } else if (jobStatus.status === 'queued' || jobStatus.status === 'active') {
                // Continue polling
                continue;
              } else {
                console.error('[CreateBlueprint] Unknown job status:', jobStatus.status);
              }
            }
            
            if (!transcriptData) {
              console.error('[CreateBlueprint] ❌ Job timed out after 30 seconds');
              return reply.code(408).send({
                success: false,
                error: 'Transcript extraction timed out. Please try a shorter video or use text content.'
              } as BlueprintResponse);
            }
            
          } else {
            // Error response
            console.error(`[CreateBlueprint] ❌ Supadata API error: ${transcriptResponse.status}`);
            
            let errorDetails;
            try {
              errorDetails = await transcriptResponse.text();
              console.error('[CreateBlueprint] Supadata error response:', errorDetails);
            } catch (e) {
              console.error('[CreateBlueprint] Could not read error response');
            }
            
            const errorMessage = transcriptResponse.status === 404 
              ? 'Video not found or transcript unavailable. Please check if the video exists and has captions enabled.'
              : transcriptResponse.status === 401 
              ? 'Transcript service configuration error - please contact support' 
              : 'Failed to extract transcript from video';
              
            return reply.code(transcriptResponse.status === 401 ? 503 : transcriptResponse.status).send({
              success: false,
              error: errorMessage
            } as BlueprintResponse);
          }

          console.log('[CreateBlueprint] ✅ Transcript data received');
          console.log('[CreateBlueprint] Response keys:', Object.keys(transcriptData));
          
          // Extract content from transcript data
          content = transcriptData.content?.trim() || '';
          
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
            transcriptLength: content.length,
            language: transcriptData.lang || 'en'
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

        // 3. Generate blueprint with Gemini AI
        console.log('[CreateBlueprint] Generating blueprint with AI...');
        
        const geminiApiKey = process.env.GOOGLE_AI_API_KEY;
        if (!geminiApiKey) {
          console.error('[CreateBlueprint] GOOGLE_AI_API_KEY not configured');
          return reply.code(503).send({
            success: false,
            error: 'AI service temporarily unavailable'
          } as BlueprintResponse);
        }

        // Construct AI prompt using external configuration
        console.log(`[CreateBlueprint] 📝 Preparing AI prompt with ${content.length} characters of content`);
        console.log('[CreateBlueprint] Content preview:', content.substring(0, 300));
        
        const prompt = buildBlueprintPrompt(formData, content);

        // Call Gemini API using external configuration
        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.model}:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: GEMINI_CONFIG.generationConfig
          })
        });

        if (!aiResponse.ok) {
          console.error(`[CreateBlueprint] Gemini API error: ${aiResponse.status}`);
          return reply.code(aiResponse.status === 429 ? 429 : 503).send({
            success: false,
            error: aiResponse.status === 429 
              ? 'AI service rate limit exceeded. Please try again in a moment.' 
              : 'AI service temporarily unavailable'
          } as BlueprintResponse);
        }

        const aiData = await aiResponse.json() as any;
        const aiText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) {
          console.error('[CreateBlueprint] Empty AI response');
          console.error('[CreateBlueprint] Full AI response:', JSON.stringify(aiData));
          return reply.code(500).send({
            success: false,
            error: 'AI failed to generate blueprint'
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
          habitsToKill: formData.habitsToKill || '',
          habitsToDevelop: formData.habitsToDevelop || '',
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

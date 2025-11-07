import { createClient } from '@supabase/supabase-js'
import type { AIBlueprint, ContentType } from '../types/blueprint'

// Create service role client for server-side operations (bypasses RLS)
// TODO Phase 8: Remove this and use authenticated user context
export const getServiceClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials for service role')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

interface SaveBlueprintParams {
  userId: string
  goal: string
  habitsToKill: string  // Comma-separated string
  habitsToDevelop: string  // Comma-separated string
  contentSource: string
  contentType: ContentType
  aiOutput: AIBlueprint
}

interface SaveBlueprintResult {
  success: boolean
  data?: {
    id: string
    user_id: string
    goal: string
    content_source: string
    content_type: ContentType
    created_at: string
  }
  error?: string
}

/**
 * Save a blueprint to the database
 * Transforms comma-separated strings to arrays for database storage
 */
export async function saveBlueprintToDatabase(
  params: SaveBlueprintParams
): Promise<SaveBlueprintResult> {
  try {
    console.log('[Database] Saving blueprint for user:', params.userId)
    
    // Transform comma-separated strings to arrays
    const habitsToKillArray = params.habitsToKill
      ? params.habitsToKill.split(',').map(h => h.trim()).filter(Boolean)
      : null
    
    const habitsToDevelopArray = params.habitsToDevelop
      ? params.habitsToDevelop.split(',').map(h => h.trim()).filter(Boolean)
      : null
    
    // Use service role client to bypass RLS
    // This is necessary because we're calling from the server without user session context
    const serviceClient = getServiceClient()
    
    // Insert blueprint into database
    const { data, error } = await serviceClient
      .from('habit_blueprints')
      .insert({
        user_id: params.userId,
        goal: params.goal,
        habits_to_kill: habitsToKillArray,
        habits_to_develop: habitsToDevelopArray,
        content_source: params.contentSource,
        content_type: params.contentType,
        ai_output: params.aiOutput as any  // JSONB field accepts any structure
      })
      .select('id, user_id, goal, content_source, content_type, created_at')
      .single()
    
    if (error) {
      console.error('[Database] Supabase error:', error)
      return {
        success: false,
        error: error.message
      }
    }
    
    console.log('[Database] ✅ Blueprint saved successfully with ID:', data.id)
    
    return {
      success: true,
      data: {
        id: data.id,
        user_id: data.user_id,
        goal: data.goal,
        content_source: data.content_source,
        content_type: data.content_type,
        created_at: data.created_at
      }
    }
    
  } catch (error: any) {
    console.error('[Database] Unexpected error:', error)
    return {
      success: false,
      error: error?.message || 'Failed to save blueprint to database'
    }
  }
}

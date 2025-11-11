import { createClient } from '@supabase/supabase-js'
import type { AIBlueprint, ContentType } from '../types/blueprint'

export interface GeminiRequestData {
  prompt: string
  metadata?: Record<string, unknown>
}

export interface GeminiRetryJob {
  id: string
  blueprint_id: string
  request_data: GeminiRequestData
  retry_count: number
  next_retry_at: string
  error_type: string | null
  last_error: string | null
  created_at: string
}

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
  contentSource: string
  contentType: ContentType
}

export interface PendingBlueprintResult {
  id: string
  user_id: string
  goal: string
  content_source: string
  content_type: ContentType
  status: 'pending'
  created_at: string
}

export async function createPendingBlueprint(params: SaveBlueprintParams): Promise<PendingBlueprintResult> {
  const serviceClient = getServiceClient()

  const { data, error } = await serviceClient
    .from('habit_blueprints')
    .insert({
      user_id: params.userId,
      goal: params.goal,
      content_source: params.contentSource,
      content_type: params.contentType,
      status: 'pending',
      ai_output: null
    })
    .select('id, user_id, goal, content_source, content_type, status, created_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as PendingBlueprintResult
}

export async function storeBlueprintResult(blueprintId: string, aiOutput: AIBlueprint): Promise<void> {
  const serviceClient = getServiceClient()

  const { error } = await serviceClient
    .from('habit_blueprints')
    .update({
      status: 'completed',
      ai_output: aiOutput as any
    })
    .eq('id', blueprintId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function markBlueprintFailed(blueprintId: string): Promise<void> {
  const serviceClient = getServiceClient()

  const { error } = await serviceClient
    .from('habit_blueprints')
    .update({ status: 'failed' })
    .eq('id', blueprintId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function enqueueRetryJob(blueprintId: string, requestData: GeminiRequestData): Promise<GeminiRetryJob> {
  const serviceClient = getServiceClient()

  const { data, error } = await serviceClient
    .from('gemini_retries')
    .insert({
      blueprint_id: blueprintId,
      request_data: requestData as any,
      retry_count: 0,
      next_retry_at: new Date().toISOString()
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return normalizeRetryJob(data)
}

export async function updateRetryJob(jobId: string, updates: Partial<Pick<GeminiRetryJob, 'retry_count' | 'next_retry_at' | 'last_error' | 'error_type'>>): Promise<void> {
  const serviceClient = getServiceClient()

  const { error } = await serviceClient
    .from('gemini_retries')
    .update(updates)
    .eq('id', jobId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function removeRetryJob(jobId: string): Promise<void> {
  const serviceClient = getServiceClient()

  const { error } = await serviceClient
    .from('gemini_retries')
    .delete()
    .eq('id', jobId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function fetchDueRetryJobs(limit: number): Promise<GeminiRetryJob[]> {
  const serviceClient = getServiceClient()
  const now = new Date().toISOString()

  const { data, error } = await serviceClient
    .from('gemini_retries')
    .select('*')
    .lte('next_retry_at', now)
    .order('next_retry_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map(normalizeRetryJob)
}

function normalizeRetryJob(row: any): GeminiRetryJob {
  return {
    id: row.id,
    blueprint_id: row.blueprint_id,
    request_data: row.request_data as GeminiRequestData,
    retry_count: row.retry_count ?? 0,
    next_retry_at: row.next_retry_at,
    error_type: row.error_type ?? null,
    last_error: row.last_error ?? null,
    created_at: row.created_at
  }
}

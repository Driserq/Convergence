import { createClient } from '@supabase/supabase-js'
import type { AIBlueprint, Blueprint, ContentType, BlueprintSourcePayload } from '../types/blueprint.js'
import type {
  BlueprintCompletionRecord,
  TrackedBlueprintRecord,
  TrackedBlueprintWithBlueprint,
  TrackedSectionType
} from '../types/tracking.js'

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

export const HABIT_TRACKING_QUOTA = 5
export const ACTION_TRACKING_QUOTA = 7

export class TrackingLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TrackingLimitError'
  }
}

export class BlueprintOwnershipError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BlueprintOwnershipError'
  }
}

export class MissingServiceRoleCredentialsError extends Error {
  constructor() {
    super('Missing Supabase credentials for service role')
    this.name = 'MissingServiceRoleCredentialsError'
  }
}

// Create service role client for server-side operations (bypasses RLS)
// TODO Phase 8: Remove this and use authenticated user context
export const getServiceClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new MissingServiceRoleCredentialsError()
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
  title?: string | null
  duration?: number | null
  videoType?: string | null
  authorName?: string | null
  sourcePayload?: BlueprintSourcePayload | null
}

export interface PendingBlueprintResult {
  id: string
  user_id: string
  goal: string
  content_source: string
  content_type: ContentType
  status: 'pending'
  created_at: string
  title?: string | null
  duration?: number | null
  video_type?: string | null
  author_name?: string | null
  source_payload?: BlueprintSourcePayload | null
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
      ai_output: null,
      title: params.title ?? null,
      duration: params.duration ?? null,
      video_type: params.videoType ?? null,
      author_name: params.authorName ?? null,
      source_payload: params.sourcePayload ?? null
    })
    .select('id, user_id, goal, content_source, content_type, status, created_at, title, duration, video_type, author_name, source_payload')
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

export async function deleteRetryJobsForBlueprint(blueprintId: string): Promise<void> {
  const serviceClient = getServiceClient()

  const { error } = await serviceClient
    .from('gemini_retries')
    .delete()
    .eq('blueprint_id', blueprintId)

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

export async function getTrackedBlueprintsForUser(userId: string): Promise<TrackedBlueprintWithBlueprint[]> {
  const serviceClient = getServiceClient()

  const { data, error } = await serviceClient
    .from('tracked_blueprints')
    .select(`
      id,
      user_id,
      blueprint_id,
      track_habits,
      track_actions,
      created_at,
      blueprint:habit_blueprints (
        id,
        user_id,
        goal,
        content_source,
        content_type,
        status,
        ai_output,
        created_at,
        title,
        duration,
        video_type
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? [])
    .filter((row) => row.blueprint)
    .map((row) => ({
      ...mapTrackedBlueprintRow(row),
      blueprint: mapBlueprintRow(row.blueprint)
    }))
}

export async function getBlueprintCompletions(userId: string): Promise<BlueprintCompletionRecord[]> {
  const serviceClient = getServiceClient()

  const { data, error } = await serviceClient
    .from('blueprint_completions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map(mapCompletionRow)
}

export interface ToggleTrackedBlueprintParams {
  userId: string
  blueprintId: string
  trackHabits?: boolean
  trackActions?: boolean
}

export interface ToggleTrackedBlueprintResult {
  tracked: TrackedBlueprintRecord
  counts: {
    habitsTracked: number
    actionsTracked: number
  }
}

const HABIT_LIMIT_ERROR_MESSAGE = 'Maximum 5 blueprints with habits tracked. Untrack habits from another blueprint first.'
const ACTION_LIMIT_ERROR_MESSAGE = 'Maximum 7 blueprints with action items tracked. Untrack action items from another blueprint first.'

export async function toggleTrackedBlueprint(params: ToggleTrackedBlueprintParams): Promise<ToggleTrackedBlueprintResult> {
  const serviceClient = getServiceClient()

  await ensureBlueprintOwnership(serviceClient, params.userId, params.blueprintId)

  const { data: existing, error: existingError } = await serviceClient
    .from('tracked_blueprints')
    .select('*')
    .eq('user_id', params.userId)
    .eq('blueprint_id', params.blueprintId)
    .maybeSingle()

  if (existingError && existingError.code !== 'PGRST116') {
    throw new Error(existingError.message)
  }

  const nextTrackHabits = params.trackHabits ?? existing?.track_habits ?? false
  const nextTrackActions = params.trackActions ?? existing?.track_actions ?? false

  const countsExcluding = await fetchTrackingCounts(serviceClient, params.userId, params.blueprintId)
  const projectedHabits = countsExcluding.habitsTracked + (nextTrackHabits ? 1 : 0)
  const projectedActions = countsExcluding.actionsTracked + (nextTrackActions ? 1 : 0)

  if (nextTrackHabits && projectedHabits > HABIT_TRACKING_QUOTA) {
    throw new TrackingLimitError(HABIT_LIMIT_ERROR_MESSAGE)
  }

  if (nextTrackActions && projectedActions > ACTION_TRACKING_QUOTA) {
    throw new TrackingLimitError(ACTION_LIMIT_ERROR_MESSAGE)
  }

  let record

  if (existing) {
    const { data, error } = await serviceClient
      .from('tracked_blueprints')
      .update({
        track_habits: nextTrackHabits,
        track_actions: nextTrackActions
      })
      .eq('id', existing.id)
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    record = data
  } else {
    const { data, error } = await serviceClient
      .from('tracked_blueprints')
      .insert({
        user_id: params.userId,
        blueprint_id: params.blueprintId,
        track_habits: nextTrackHabits,
        track_actions: nextTrackActions
      })
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    record = data
  }

  return {
    tracked: mapTrackedBlueprintRow(record),
    counts: {
      habitsTracked: projectedHabits,
      actionsTracked: projectedActions
    }
  }
}

export interface CompletionMutationParams {
  userId: string
  blueprintId: string
  sectionType: TrackedSectionType
  itemId: string
  completedOn?: string
}

export async function upsertBlueprintCompletion(params: CompletionMutationParams): Promise<BlueprintCompletionRecord> {
  const serviceClient = getServiceClient()

  await ensureBlueprintOwnership(serviceClient, params.userId, params.blueprintId)

  const completedOn = toISODate(params.completedOn)

  const { data, error } = await serviceClient
    .from('blueprint_completions')
    .upsert(
      {
        user_id: params.userId,
        blueprint_id: params.blueprintId,
        section_type: params.sectionType,
        item_id: params.itemId,
        completed_on: completedOn
      },
      {
        onConflict: 'user_id,blueprint_id,section_type,item_id,completed_on'
      }
    )
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapCompletionRow(data)
}

export async function deleteBlueprintCompletion(params: CompletionMutationParams): Promise<void> {
  const serviceClient = getServiceClient()

  await ensureBlueprintOwnership(serviceClient, params.userId, params.blueprintId)

  const completedOn = toISODate(params.completedOn)

  const { error } = await serviceClient
    .from('blueprint_completions')
    .delete()
    .eq('user_id', params.userId)
    .eq('blueprint_id', params.blueprintId)
    .eq('section_type', params.sectionType)
    .eq('item_id', params.itemId)
    .eq('completed_on', completedOn)

  if (error) {
    throw new Error(error.message)
  }
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

function mapBlueprintRow(row: any): Blueprint {
  if (!row) {
    throw new BlueprintOwnershipError('Blueprint not found')
  }

  return {
    id: row.id,
    user_id: row.user_id,
    goal: row.goal,
    content_source: row.content_source,
    content_type: row.content_type,
    ai_output: row.ai_output as AIBlueprint | null,
    created_at: row.created_at,
    status: row.status,
    title: row.title ?? null,
    duration: row.duration ?? null,
    video_type: row.video_type ?? null,
    source_payload: row.source_payload ?? null
  }
}

function mapTrackedBlueprintRow(row: any): TrackedBlueprintRecord {
  return {
    id: row.id,
    userId: row.user_id,
    blueprintId: row.blueprint_id,
    trackHabits: Boolean(row.track_habits),
    trackActions: Boolean(row.track_actions),
    createdAt: row.created_at
  }
}

function mapCompletionRow(row: any): BlueprintCompletionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    blueprintId: row.blueprint_id,
    sectionType: row.section_type,
    itemId: row.item_id,
    completedOn: row.completed_on,
    completedAt: row.completed_at
  }
}

async function ensureBlueprintOwnership(serviceClient: ReturnType<typeof getServiceClient>, userId: string, blueprintId: string) {
  const { data, error } = await serviceClient
    .from('habit_blueprints')
    .select('id, user_id')
    .eq('id', blueprintId)
    .single()

  if (error || !data || data.user_id !== userId) {
    throw new BlueprintOwnershipError('Blueprint not found or access denied')
  }
}

async function fetchTrackingCounts(serviceClient: ReturnType<typeof getServiceClient>, userId: string, excludeBlueprintId?: string) {
  const { data, error } = await serviceClient
    .from('tracked_blueprints')
    .select('blueprint_id, track_habits, track_actions')
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }

  const filtered = (data ?? []).filter((row) => row.blueprint_id !== excludeBlueprintId)

  return {
    habitsTracked: filtered.filter((row) => row.track_habits).length,
    actionsTracked: filtered.filter((row) => row.track_actions).length
  }
}

function toISODate(value?: string) {
  if (value) {
    return value.split('T')[0]
  }
  return new Date().toISOString().split('T')[0]
}

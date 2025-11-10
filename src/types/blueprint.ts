// Content source types
export type ContentType = 'youtube' | 'text'

// Input form data types
export interface BlueprintFormData {
  goal: string
  contentType: ContentType
  youtubeUrl: string
  textContent: string
}

// YouTube video information
export interface YouTubeVideoInfo {
  videoId: string
  title?: string
  duration?: number // in seconds
  thumbnailUrl?: string
}

// Individual habit step (from AI response) - LEGACY FORMAT
export interface HabitStep {
  id: number
  title: string
  description: string
  timeframe: string
}

// New adaptive blueprint field types
export interface SequentialStep {
  step_number: number
  title: string
  description: string
  deliverable: string
  estimated_time?: string
}

export interface DailyHabit {
  id: number
  title: string
  description: string
  timeframe: string
}

export interface TriggerAction {
  situation: string
  immediate_action: string
  timeframe: string
}

export interface DecisionQuestion {
  question: string
  weight?: string // "Critical", "Important", "Consider"
}

export interface Resource {
  name: string
  type: string // "tool", "book", "article", "course"
  description: string
}

// Overview structure (already used in current implementation)
export interface OverviewSection {
  summary: string
  mistakes: string[]
  guidance: string[]
}

// New adaptive AI blueprint output
export interface AdaptiveBlueprintOutput {
  overview: OverviewSection
  sequential_steps?: SequentialStep[]
  daily_habits?: DailyHabit[]
  trigger_actions?: TriggerAction[]
  decision_checklist?: DecisionQuestion[]
  resources?: Resource[]
}

// Legacy AI blueprint output (current format with habits array)
export interface LegacyBlueprintOutput {
  overview: OverviewSection // Already structured in current implementation
  habits: HabitStep[]
}

// Union type for AI output (handles both old and new formats)
export type AIBlueprint = AdaptiveBlueprintOutput | LegacyBlueprintOutput

// Type guard helper functions for safe type narrowing
export function isAdaptiveBlueprintOutput(blueprint: AIBlueprint): blueprint is AdaptiveBlueprintOutput {
  return 'sequential_steps' in blueprint || 'daily_habits' in blueprint || 'trigger_actions' in blueprint
}

export function isLegacyBlueprintOutput(blueprint: AIBlueprint): blueprint is LegacyBlueprintOutput {
  return 'habits' in blueprint && !isAdaptiveBlueprintOutput(blueprint)
}

// Complete blueprint (matches database schema)
export interface Blueprint {
  id: string
  user_id: string
  goal: string
  content_source: string // YouTube URL or "Text Input"
  content_type: ContentType
  ai_output: AIBlueprint
  created_at: string
}

// Saved blueprint response from API (includes database fields)
export interface SavedBlueprintResponse {
  success: boolean
  blueprint: Blueprint  // Full database record (includes ai_output + all DB fields)
  metadata?: {
    contentType: 'youtube' | 'text'
    url?: string
    videoId?: string
    transcriptLength?: number
    language?: string
  }
  error?: string
}

// Form validation errors
export interface FormErrors {
  goal?: string
  youtubeUrl?: string
  textContent?: string
  contentType?: string
  general?: string
}

// Form submission state
export interface FormSubmissionState {
  isSubmitting: boolean
  isSuccess: boolean
  error: string | null
}
import { z } from 'zod'
import type { ContentType } from '../types/blueprint'

// YouTube URL validation regex patterns
const YOUTUBE_URL_PATTERNS = [
  /^https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
  /^https?:\/\/(www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
  /^https?:\/\/(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  /^https?:\/\/(www\.)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
]

// YouTube video ID extraction
export const extractYouTubeVideoId = (url: string): string | null => {
  try {
    for (const pattern of YOUTUBE_URL_PATTERNS) {
      const match = url.match(pattern)
      if (match && match[2]) {
        return match[2]
      }
    }
    return null
  } catch (error) {
    console.error('[Validation] Error extracting YouTube video ID:', error)
    return null
  }
}

// Custom YouTube URL validator
const youtubeUrlValidator = z.string().refine(
  (url) => {
    if (!url) return true // Optional field when not selected
    const videoId = extractYouTubeVideoId(url)
    return videoId !== null
  },
  {
    message: 'Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)'
  }
)

// Content type enum
const contentTypeSchema = z.enum(['youtube', 'text'] as const)

// Main blueprint form validation schema
export const blueprintFormSchema = z.object({
  // Primary goal (required)
  goal: z
    .string()
    .min(1, 'Primary goal is required')
    .min(10, 'Goal should be at least 10 characters for better AI analysis')
    .max(500, 'Goal should be less than 500 characters')
    .trim(),

  // Habits to kill (optional, comma-separated)
  habitsToKill: z
    .string()
    .max(1000, 'Habits to kill should be less than 1000 characters')
    .optional()
    .default(''),

  // Habits to develop (optional, comma-separated)  
  habitsToDevelop: z
    .string()
    .max(1000, 'Habits to develop should be less than 1000 characters')
    .optional()
    .default(''),

  // Content type selection
  contentType: contentTypeSchema,

  // YouTube URL (conditional validation)
  youtubeUrl: youtubeUrlValidator.optional().default(''),

  // Text content (conditional validation)
  textContent: z
    .string()
    .max(50000, 'Text content should be less than 50,000 characters')
    .optional()
    .default(''),
}).refine(
  (data) => {
    // Ensure at least one content source is provided
    if (data.contentType === 'youtube') {
      return data.youtubeUrl && data.youtubeUrl.trim().length > 0
    }
    if (data.contentType === 'text') {
      return data.textContent && data.textContent.trim().length >= 50
    }
    return false
  },
  {
    message: 'Please provide content source: either a YouTube URL or at least 50 characters of text',
    path: ['contentType'] // This will show the error on the content type field
  }
)

// Type inference from schema
export type BlueprintFormInput = z.infer<typeof blueprintFormSchema>

// YouTube URL validation helper
export const validateYouTubeUrl = (url: string): { isValid: boolean; videoId?: string; error?: string } => {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'YouTube URL is required' }
  }

  const videoId = extractYouTubeVideoId(url)
  
  if (!videoId) {
    return { 
      isValid: false, 
      error: 'Invalid YouTube URL. Please use format: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID' 
    }
  }

  return { isValid: true, videoId }
}

// Text content validation helper
export const validateTextContent = (text: string): { isValid: boolean; error?: string } => {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: 'Text content is required' }
  }

  if (text.trim().length < 50) {
    return { 
      isValid: false, 
      error: 'Text content should be at least 50 characters for meaningful analysis' 
    }
  }

  if (text.length > 50000) {
    return { 
      isValid: false, 
      error: 'Text content should be less than 50,000 characters' 
    }
  }

  return { isValid: true }
}

// Helper to parse comma-separated habits
export const parseHabits = (habitString: string): string[] => {
  if (!habitString || habitString.trim() === '') {
    return []
  }
  
  return habitString
    .split(',')
    .map(habit => habit.trim())
    .filter(habit => habit.length > 0)
}
import { z } from 'zod'
import type { ContentType } from '../types/blueprint.js'
import { extractYouTubeVideoId, isValidYouTubeUrl } from './youtube.js'

export { extractYouTubeVideoId }

// Custom YouTube URL validator
const youtubeUrlValidator = z.string().refine(
  (url) => {
    if (!url) return true // Optional field when not selected
    return isValidYouTubeUrl(url)
  },
  {
    message: 'Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)'
  }
)

// Content type enum
const contentTypeSchema = z.enum(['youtube', 'text'] as const)

// Main blueprint form validation schema
export const blueprintFormSchema = z.object({
  // User focus (optional)
  goal: z
    .string()
    .default('')
    .transform(value => value.trim())
    .superRefine((value, ctx) => {
      if (!value) return
      if (value.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Focus should be at least 10 characters for better AI analysis',
          path: ['goal']
        })
      }
      if (value.length > 500) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Focus should be less than 500 characters',
          path: ['goal']
        })
      }
    }),

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
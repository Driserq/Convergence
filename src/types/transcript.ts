// Supadata.ai API types for transcript extraction

// Supadata API request parameters
export interface SupadataTranscriptRequest {
  url?: string      // Full YouTube URL (e.g., "https://youtu.be/dQw4w9WgXcQ")
  videoId?: string  // Just the video ID (e.g., "dQw4w9WgXcQ")
}

// Supadata API response format
export interface SupadataTranscriptResponse {
  content: string   // The transcript text
  lang: string      // Language code (e.g., "en", "es", "fr")
}

// Alternative format for YouTube-specific endpoint (with timestamps)
export interface SupadataTimestampedTranscript {
  lang: string
  content: Array<{
    text: string      // Text segment
    offset: number    // Start time in milliseconds
    duration: number  // Duration in milliseconds
    lang: string      // Language code
  }>
}

// Our internal transcript service request
export interface TranscriptServiceRequest {
  youtubeUrl: string    // Full YouTube URL from form
  videoId?: string      // Extracted video ID (optional, we'll extract it)
}

// Our internal transcript service response
export interface TranscriptServiceResponse {
  success: boolean
  transcript?: string   // Plain text transcript
  language?: string     // Detected language
  error?: TranscriptError
  metadata?: {
    videoId: string
    originalUrl: string
    textLength: number
    estimatedDuration?: number  // In minutes (for future video duration warnings)
  }
}

// Error types for transcript extraction
export interface TranscriptError {
  code: TranscriptErrorCode
  message: string
  details?: string
}

export enum TranscriptErrorCode {
  INVALID_URL = 'INVALID_URL',
  VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND', 
  TRANSCRIPT_UNAVAILABLE = 'TRANSCRIPT_UNAVAILABLE',
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_KEY_INVALID = 'API_KEY_INVALID',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  RATE_LIMITED = 'RATE_LIMITED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// HTTP status code mappings for Supadata API
export const SUPADATA_ERROR_MAPPINGS: Record<number, TranscriptErrorCode> = {
  400: TranscriptErrorCode.INVALID_URL,
  401: TranscriptErrorCode.API_KEY_INVALID,
  402: TranscriptErrorCode.QUOTA_EXCEEDED,
  404: TranscriptErrorCode.VIDEO_NOT_FOUND,
  429: TranscriptErrorCode.RATE_LIMITED,
  500: TranscriptErrorCode.API_ERROR,
  502: TranscriptErrorCode.API_ERROR,
  503: TranscriptErrorCode.API_ERROR,
  504: TranscriptErrorCode.API_ERROR,
}

// User-friendly error messages
export const ERROR_MESSAGES: Record<TranscriptErrorCode, string> = {
  [TranscriptErrorCode.INVALID_URL]: 'Please provide a valid YouTube URL',
  [TranscriptErrorCode.VIDEO_NOT_FOUND]: 'YouTube video not found or is private/unavailable',
  [TranscriptErrorCode.TRANSCRIPT_UNAVAILABLE]: 'No transcript is available for this video',
  [TranscriptErrorCode.API_KEY_MISSING]: 'Transcript service is temporarily unavailable',
  [TranscriptErrorCode.API_KEY_INVALID]: 'Transcript service configuration error',
  [TranscriptErrorCode.QUOTA_EXCEEDED]: 'Transcript service quota exceeded. Please try again later',
  [TranscriptErrorCode.RATE_LIMITED]: 'Too many requests. Please wait a moment and try again',
  [TranscriptErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection and try again',
  [TranscriptErrorCode.API_ERROR]: 'Transcript service is temporarily unavailable',
  [TranscriptErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred'
}
// Transcript extraction service using Supadata.ai

import { 
  TranscriptServiceRequest, 
  TranscriptServiceResponse, 
  TranscriptErrorCode, 
  SupadataTranscriptResponse,
  SUPADATA_ERROR_MAPPINGS,
  ERROR_MESSAGES 
} from '../types/transcript.js';
import { extractYouTubeVideoId, isValidYouTubeUrl, getContentLengthWarning } from './youtube.js';

// Supadata.ai API configuration
const SUPADATA_BASE_URL = 'https://api.supadata.ai';
const TRANSCRIPT_ENDPOINT = '/v1/transcript'; // Changed from /v1/youtube/transcript
const VIDEO_METADATA_ENDPOINT = '/v1/youtube/video';
const REQUEST_TIMEOUT = 30000; // 30 seconds

interface SupadataVideoMetadataResponse {
  title?: string;
  name?: string;
  videoId?: string;
  video_id?: string;
  duration?: string;
  description?: string;
  author?: string;
  channel?: string;
  channelTitle?: string;
  channel_name?: string;
  uploader?: string;
  owner?: string;
  creator?: string;
  user?: string;
  [key: string]: any;
}

export interface VideoMetadata {
  title?: string;
  durationSeconds?: number | null;
  videoId?: string;
  authorName?: string;
}

function extractAuthorName(value: unknown): string | undefined {
  if (!value) return undefined;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (typeof value === 'object') {
    const possibleFields = ['title', 'name', 'displayName', 'owner', 'username'];
    for (const field of possibleFields) {
      const nestedValue = (value as Record<string, unknown>)[field];
      if (typeof nestedValue === 'string') {
        const trimmed = nestedValue.trim();
        if (trimmed.length > 0) {
          return trimmed;
        }
      }
    }
  }

  return undefined;
}

/**
 * Clean YouTube URL to remove tracking parameters
 * Supadata has issues with URLs containing &pp= and other tracking params
 */
function cleanYouTubeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Standard YouTube URL
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    
    // Short URL (youtu.be)
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1); // Remove leading /
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    return url; // Return original if can't parse
  } catch (e) {
    console.warn('[TranscriptService] Failed to parse URL, using original:', e);
    return url; // Return original if URL parsing fails
  }
}

function parseDurationToSeconds(duration?: string | number | null): number | null {
  if (duration == null) return null;

  if (typeof duration === 'number' && Number.isFinite(duration)) {
    return Math.max(0, Math.round(duration));
  }

  if (typeof duration === 'string') {
    const trimmed = duration.trim();
    if (!trimmed) {
      return null;
    }

    const numericValue = Number(trimmed);
    if (!Number.isNaN(numericValue)) {
      return Math.max(0, Math.round(numericValue));
    }

    const isoMatch = trimmed.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
    if (isoMatch) {
      const hours = isoMatch[1] ? parseInt(isoMatch[1], 10) : 0;
      const minutes = isoMatch[2] ? parseInt(isoMatch[2], 10) : 0;
      const seconds = isoMatch[3] ? parseInt(isoMatch[3], 10) : 0;
      return (hours * 3600) + (minutes * 60) + seconds;
    }
  }

  return null;
}

export async function fetchVideoMetadata(youtubeUrl: string): Promise<VideoMetadata | null> {
  try {
    const apiKey = process.env.SUPADATA_API_KEY;
    if (!apiKey) {
      console.warn('[TranscriptService] Cannot fetch video metadata without SUPADATA_API_KEY');
      return null;
    }

    const cleanUrl = cleanYouTubeUrl(youtubeUrl);
    const preferredId = extractYouTubeVideoId(cleanUrl) ?? cleanUrl;
    const encodedId = encodeURIComponent(preferredId);
    const response = await fetch(`${SUPADATA_BASE_URL}${VIDEO_METADATA_ENDPOINT}?id=${encodedId}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'User-Agent': 'Convergence-MVP/1.0'
      }
    });

    if (!response.ok) {
      console.error('[TranscriptService] Video metadata fetch failed:', response.status);
      return null;
    }

    const payload = (await response.json()) as SupadataVideoMetadataResponse | { data?: SupadataVideoMetadataResponse };
    const data = 'data' in payload && payload.data ? payload.data : payload;

    if (!data) {
      return null;
    }

    const videoData = data as SupadataVideoMetadataResponse;
    const durationSeconds = parseDurationToSeconds(videoData.duration);
    const rawTitle = typeof videoData.title === 'string' ? videoData.title : typeof videoData.name === 'string' ? videoData.name : undefined;
    const normalizedTitle = rawTitle?.trim();
    const authorCandidates: unknown[] = [
      videoData.channelTitle,
      videoData.channel,
      videoData.channel_name,
      videoData.author,
      videoData.creator,
      videoData.owner,
      videoData.uploader,
      videoData.user
    ];
    const normalizedAuthor = authorCandidates
      .map((candidate) => extractAuthorName(candidate))
      .find((value) => typeof value === 'string' && value.length > 0);

    return {
      title: normalizedTitle && normalizedTitle.length > 0 ? normalizedTitle : undefined,
      durationSeconds,
      videoId: videoData.videoId || videoData.video_id || extractYouTubeVideoId(cleanUrl) || extractYouTubeVideoId(preferredId) || undefined,
      authorName: normalizedAuthor || undefined
    };
  } catch (error) {
    console.error('[TranscriptService] Failed to fetch video metadata:', error);
    return null;
  }
}

/**
 * Main transcript extraction service
 * Uses Supadata.ai to fetch YouTube video transcripts
 */
export async function extractTranscript(
  request: TranscriptServiceRequest
): Promise<TranscriptServiceResponse> {
  
  try {
    console.log('[TranscriptService] Starting transcript extraction for:', request.youtubeUrl);
    
    // Validate YouTube URL
    if (!isValidYouTubeUrl(request.youtubeUrl)) {
      return {
        success: false,
        error: {
          code: TranscriptErrorCode.INVALID_URL,
          message: ERROR_MESSAGES[TranscriptErrorCode.INVALID_URL]
        }
      };
    }

    // Extract video ID for metadata
    const videoId = extractYouTubeVideoId(request.youtubeUrl);
    if (!videoId) {
      return {
        success: false,
        error: {
          code: TranscriptErrorCode.INVALID_URL,
          message: ERROR_MESSAGES[TranscriptErrorCode.INVALID_URL]
        }
      };
    }

    // Check if API key is available
    const apiKey = process.env.SUPADATA_API_KEY;
    if (!apiKey) {
      console.error('[TranscriptService] SUPADATA_API_KEY not configured');
      return {
        success: false,
        error: {
          code: TranscriptErrorCode.API_KEY_MISSING,
          message: ERROR_MESSAGES[TranscriptErrorCode.API_KEY_MISSING]
        }
      };
    }

    // Make API request to Supadata
    const response = await fetchSupadataTranscript(request.youtubeUrl, apiKey);
    
    if (!response.success) {
      return response; // Already formatted error response
    }

    // Success - format the response
    const transcript = response.transcript!;
    const lengthWarning = getContentLengthWarning(transcript.length);
    
    if (lengthWarning) {
      console.log('[TranscriptService]', lengthWarning);
    }

    console.log(`[TranscriptService] Successfully extracted transcript (${transcript.length} chars)`);
    
    return {
      success: true,
      transcript,
      language: response.language,
      metadata: {
        videoId,
        originalUrl: request.youtubeUrl,
        textLength: transcript.length,
        estimatedDuration: Math.round(transcript.length / (150 * 5)) // Rough estimate
      }
    };

  } catch (error) {
    console.error('[TranscriptService] Unexpected error:', error);
    return {
      success: false,
      error: {
        code: TranscriptErrorCode.UNKNOWN_ERROR,
        message: ERROR_MESSAGES[TranscriptErrorCode.UNKNOWN_ERROR],
        details: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

/**
 * Makes the actual HTTP request to Supadata.ai
 * Now uses GET method with query parameters per official API docs
 */
async function fetchSupadataTranscript(
  youtubeUrl: string, 
  apiKey: string
): Promise<TranscriptServiceResponse> {
  
  try {
    console.log('[TranscriptService] Original URL:', youtubeUrl);
    
    // Clean URL to remove tracking parameters
    const cleanUrl = cleanYouTubeUrl(youtubeUrl);
    console.log('[TranscriptService] Cleaned URL:', cleanUrl);
    
    // Encode URL for query parameter
    const encodedUrl = encodeURIComponent(cleanUrl);
    
    // Build GET request URL with query parameters
    const url = `${SUPADATA_BASE_URL}${TRANSCRIPT_ENDPOINT}?url=${encodedUrl}&lang=en&text=true&mode=auto`;
    
    console.log('[TranscriptService] Fetching transcript from:', url.substring(0, 100) + '...');
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    // Use GET method per official API documentation
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'User-Agent': 'Convergence-MVP/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('[TranscriptService] Response status:', response.status);

    // Handle 202 (Async job) - for large videos
    if (response.status === 202) {
      console.log('[TranscriptService] Async job created, polling for results...');
      const jobData = await response.json() as any;
      const jobId = jobData.jobId;
      
      if (!jobId) {
        return {
          success: false,
          error: {
            code: TranscriptErrorCode.API_ERROR,
            message: 'Failed to create transcript job',
            details: 'No jobId in response'
          }
        };
      }
      
      console.log('[TranscriptService] Job ID:', jobId);
      
      // Poll for job completion
      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const jobResponse = await fetch(`${SUPADATA_BASE_URL}${TRANSCRIPT_ENDPOINT}/${jobId}`, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey
          }
        });
        
        if (!jobResponse.ok) {
          console.error(`[TranscriptService] Job status check failed: ${jobResponse.status}`);
          continue;
        }
        
        const jobStatus = await jobResponse.json() as any;
        console.log(`[TranscriptService] Job status (${attempts}/${maxAttempts}):`, jobStatus.status);
        
        if (jobStatus.status === 'completed') {
          const data = jobStatus.result;
          
          if (!data.content || typeof data.content !== 'string') {
            return {
              success: false,
              error: {
                code: TranscriptErrorCode.API_ERROR,
                message: ERROR_MESSAGES[TranscriptErrorCode.API_ERROR],
                details: 'Invalid response format from job'
              }
            };
          }
          
          if (data.content.trim().length < 10) {
            return {
              success: false,
              error: {
                code: TranscriptErrorCode.TRANSCRIPT_UNAVAILABLE,
                message: ERROR_MESSAGES[TranscriptErrorCode.TRANSCRIPT_UNAVAILABLE]
              }
            };
          }
          
          return {
            success: true,
            transcript: data.content.trim(),
            language: data.lang || 'unknown'
          };
          
        } else if (jobStatus.status === 'failed') {
          return {
            success: false,
            error: {
              code: TranscriptErrorCode.API_ERROR,
              message: 'Transcript generation failed',
              details: jobStatus.error || 'Unknown error'
            }
          };
        }
      }
      
      // Timeout
      return {
        success: false,
        error: {
          code: TranscriptErrorCode.NETWORK_ERROR,
          message: 'Transcript extraction timed out',
          details: 'Job did not complete within 30 seconds'
        }
      };
    }

    // Handle non-200 status codes
    if (!response.ok) {
      const errorCode = mapHttpStatusToErrorCode(response.status);
      let errorMessage = ERROR_MESSAGES[errorCode];
      
      // Try to get more specific error details from response
      try {
        const errorData = await response.text();
        console.error('[TranscriptService] API error response:', errorData);
      } catch (e) {
        // Ignore parsing errors for error responses
      }

      console.error(`[TranscriptService] API error ${response.status}: ${errorMessage}`);
      
      return {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          details: `HTTP ${response.status}`
        }
      };
    }

    // Parse successful response (HTTP 200)
    const data = await response.json() as SupadataTranscriptResponse;
    
    if (!data.content || typeof data.content !== 'string') {
      console.error('[TranscriptService] Invalid API response format:', data);
      return {
        success: false,
        error: {
          code: TranscriptErrorCode.API_ERROR,
          message: ERROR_MESSAGES[TranscriptErrorCode.API_ERROR],
          details: 'Invalid response format'
        }
      };
    }

    // Check if transcript is empty or very short
    if (data.content.trim().length < 10) {
      return {
        success: false,
        error: {
          code: TranscriptErrorCode.TRANSCRIPT_UNAVAILABLE,
          message: ERROR_MESSAGES[TranscriptErrorCode.TRANSCRIPT_UNAVAILABLE]
        }
      };
    }

    return {
      success: true,
      transcript: data.content.trim(),
      language: data.lang || 'unknown'
    };

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[TranscriptService] Request timeout');
      return {
        success: false,
        error: {
          code: TranscriptErrorCode.NETWORK_ERROR,
          message: 'Request timeout - please try again',
          details: 'Request timed out after 30 seconds'
        }
      };
    }

    console.error('[TranscriptService] Network error:', error);
    return {
      success: false,
      error: {
        code: TranscriptErrorCode.NETWORK_ERROR,
        message: ERROR_MESSAGES[TranscriptErrorCode.NETWORK_ERROR],
        details: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

/**
 * Maps HTTP status codes to our internal error codes
 */
function mapHttpStatusToErrorCode(status: number): TranscriptErrorCode {
  return SUPADATA_ERROR_MAPPINGS[status] || TranscriptErrorCode.API_ERROR;
}

export function transcriptErrorToStatus(errorCode: TranscriptErrorCode): number {
  switch (errorCode) {
    case TranscriptErrorCode.INVALID_URL:
      return 400;
    case TranscriptErrorCode.VIDEO_NOT_FOUND:
    case TranscriptErrorCode.TRANSCRIPT_UNAVAILABLE:
      return 404;
    case TranscriptErrorCode.API_KEY_MISSING:
    case TranscriptErrorCode.API_KEY_INVALID:
      return 503;
    case TranscriptErrorCode.QUOTA_EXCEEDED:
    case TranscriptErrorCode.RATE_LIMITED:
      return 429;
    case TranscriptErrorCode.NETWORK_ERROR:
      return 502;
    case TranscriptErrorCode.API_ERROR:
      return 502;
    case TranscriptErrorCode.UNKNOWN_ERROR:
    default:
      return 500;
  }
}

/**
 * Helper function for testing/debugging - validates service configuration
 */
export function validateTranscriptService(): { 
  configured: boolean; 
  error?: string 
} {
  const apiKey = process.env.SUPADATA_API_KEY;
  
  if (!apiKey) {
    return { 
      configured: false, 
      error: 'SUPADATA_API_KEY environment variable not set' 
    };
  }
  
  if (apiKey.length < 10) {
    return { 
      configured: false, 
      error: 'SUPADATA_API_KEY appears to be invalid (too short)' 
    };
  }
  
  return { configured: true };
}

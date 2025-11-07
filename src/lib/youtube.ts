// YouTube URL parsing and video ID extraction utilities

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID&t=123s
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Clean the URL and remove any trailing whitespace
  const cleanUrl = url.trim();
  
  // Various YouTube URL patterns
  const patterns = [
    // Standard youtube.com/watch?v=
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // Short youtu.be/
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // Embed format
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // Mobile format
    /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validates if a string is a valid YouTube video ID
 * YouTube video IDs are exactly 11 characters long and contain only
 * letters, numbers, hyphens, and underscores
 */
export function isValidYouTubeVideoId(videoId: string): boolean {
  if (!videoId || typeof videoId !== 'string') {
    return false;
  }
  
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

/**
 * Validates if a URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  const videoId = extractYouTubeVideoId(url);
  return videoId !== null && isValidYouTubeVideoId(videoId);
}

/**
 * Normalizes a YouTube URL to the standard watch format
 * Returns null if the URL is invalid
 */
export function normalizeYouTubeUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) {
    return null;
  }
  
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Gets video metadata from URL (for display purposes)
 */
export function getVideoMetadata(url: string): {
  videoId: string;
  normalizedUrl: string;
} | null {
  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) {
    return null;
  }
  
  return {
    videoId,
    normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`
  };
}

/**
 * Creates a YouTube thumbnail URL for display
 * Default quality: maxresdefault (1280x720)
 * Fallback: hqdefault (480x360)
 */
export function getYouTubeThumbnail(
  videoId: string, 
  quality: 'default' | 'hqdefault' | 'maxresdefault' = 'hqdefault'
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Estimates content length warnings based on video duration
 * Note: This would require YouTube API for actual duration
 * For now, we'll use transcript length as a proxy
 */
export function getContentLengthWarning(transcriptLength: number): string | null {
  // Very rough estimate: ~150 words per minute for speech
  // ~5 characters per word average
  const estimatedMinutes = Math.round(transcriptLength / (150 * 5));
  
  if (estimatedMinutes > 90) {
    return `This appears to be a very long video (~${estimatedMinutes} minutes). Processing may take longer.`;
  }
  
  if (estimatedMinutes > 45) {
    return `This appears to be a long video (~${estimatedMinutes} minutes). Processing may take a moment.`;
  }
  
  return null;
}
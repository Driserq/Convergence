// YouTube URL parsing and video ID extraction utilities

const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
const YOUTUBE_BASE_HOST = 'youtube.com';
const YOUTUBE_SHORT_HOST = 'youtu.be';

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase();
}

function isShortYouTubeHost(hostname: string): boolean {
  return normalizeHostname(hostname) === YOUTUBE_SHORT_HOST;
}

function normalizeVideoId(candidate?: string | null): string | null {
  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();
  return YOUTUBE_VIDEO_ID_PATTERN.test(trimmed) ? trimmed : null;
}

function getUrlCandidates(raw: string): URL[] {
  const candidates: URL[] = [];

  try {
    candidates.push(new URL(raw));
  } catch (_) {
    // ignore
  }

  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+-.]*:/.test(raw);
  if (!hasProtocol) {
    try {
      candidates.push(new URL(`https://${raw}`));
    } catch (_) {
      // ignore
    }
  }

  return candidates;
}

function extractVideoIdFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  if (segments.length === 1) {
    return normalizeVideoId(segments[0]);
  }

  const [first, second] = segments;
  if (['embed', 'shorts', 'watch', 'v'].includes(first)) {
    return normalizeVideoId(second ?? null);
  }

  return null;
}

export function isTrustedYouTubeHost(hostname: string): boolean {
  if (!hostname) {
    return false;
  }

  const normalized = normalizeHostname(hostname);
  if (normalized === YOUTUBE_BASE_HOST || normalized.endsWith(`.${YOUTUBE_BASE_HOST}`)) {
    return true;
  }

  return normalized === YOUTUBE_SHORT_HOST;
}

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

  const trimmed = url.trim();

  const urlCandidates = getUrlCandidates(trimmed);

  for (const candidate of urlCandidates) {
    const hostname = normalizeHostname(candidate.hostname);
    if (!isTrustedYouTubeHost(hostname)) {
      continue;
    }

    if (isShortYouTubeHost(hostname)) {
      const shortId = normalizeVideoId(candidate.pathname.replace(/^\/+/, '').split(/[/?#]/)[0]);
      if (shortId) {
        return shortId;
      }
      continue;
    }

    const queryId = normalizeVideoId(candidate.searchParams.get('v'));
    if (queryId) {
      return queryId;
    }

    const pathId = extractVideoIdFromPath(candidate.pathname);
    if (pathId) {
      return pathId;
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
  
  return YOUTUBE_VIDEO_ID_PATTERN.test(videoId);
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
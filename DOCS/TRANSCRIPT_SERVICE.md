# YouTube Transcript Service - Supadata.ai

## Overview
We use Supadata.ai REST API for YouTube transcript extraction in the Consum MVP.

## Why Supadata.ai?
- **Free Tier**: 100 requests/month (no credit card required)
- **No IP Blocking**: Prevents YouTube from blocking our server IP in production
- **Production Ready**: Used by 7000+ makers, handles proxies and rate limits automatically
- **Simple API**: REST endpoint, no npm package needed - just HTTP requests
- **Reliable Infrastructure**: High availability and performance for bulk requests
- **Multiple Sources**: Supports YouTube, TikTok, Instagram, X (Twitter) and video files

## API Details
- **Base URL**: `https://api.supadata.ai/v1`
- **Transcript Endpoint**: `GET /transcript?url={youtube_url}`
- **YouTube Specific**: `GET /youtube/transcript?videoId={video_id}`
- **Authentication Header**: `x-api-key: YOUR_SUPADATA_API_KEY`
- **Response Format**: JSON with `content` (transcript text) and `lang` (language)

### Sample Request
```bash
curl 'https://api.supadata.ai/v1/transcript?url=https://youtu.be/dQw4w9WgXcQ' \\
  -H 'x-api-key: YOUR_SUPADATA_API_KEY'
```

### Sample Response
```json
{
  "content": "Never gonna give you up, never gonna let you down...",
  "lang": "en"
}
```

### YouTube-Specific Endpoint (Alternative)
```bash
curl 'https://api.supadata.ai/v1/youtube/transcript?videoId=dQw4w9WgXcQ' \\
  -H 'x-api-key: YOUR_SUPADATA_API_KEY'
```

## Environment Variable
```bash
SUPADATA_API_KEY=your_api_key_here
```

## Error Handling
The API returns standard HTTP status codes:
- **200**: Success
- **400**: Invalid parameters (bad URL, unsupported format)
- **401**: Missing or invalid API key
- **402**: Payment required (quota exceeded)
- **404**: Video not found or unavailable
- **429**: Rate limit exceeded
- **5xx**: Server errors

## Rate Limits
- **Free Plan**: 100 requests/month
- **Upgrade Path**: Available if needed post-MVP launch
- Current limits shown on [pricing page](https://supadata.ai)

## Implementation (Phase 4)
Will create `src/lib/transcript.ts` service to:

1. **Accept YouTube URL** from frontend form submission
2. **Extract Video ID** using our existing validation logic
3. **Make HTTP Request** to Supadata API with proper headers
4. **Return Transcript Text** for AI processing in Phase 5
5. **Handle All Errors** gracefully with user-friendly messages
   - Invalid URLs or video IDs
   - API failures and timeouts
   - Quota limits and rate limiting
   - Videos without transcripts available

## Security
- ✅ API key stored server-side only (never exposed to client)
- ✅ All requests made from server, not browser
- ✅ Input validation on YouTube URLs before API calls
- ✅ Error messages don't expose API keys or internal details

## Integration Flow
```
User Form → YouTube URL → Video ID Extraction → Supadata API → Transcript Text → AI Processing
```

## References
- **Main Site**: [https://supadata.ai](https://supadata.ai)
- **Documentation**: [https://docs.supadata.ai](https://docs.supadata.ai)
- **API Reference**: [https://docs.supadata.ai/api-reference/introduction](https://docs.supadata.ai/api-reference/introduction)
- **YouTube Transcript API**: [https://supadata.ai/youtube-transcript-api](https://supadata.ai/youtube-transcript-api)
- **Dashboard**: [https://dash.supadata.ai](https://dash.supadata.ai)

## MVP Considerations
- 100 requests/month should be sufficient for 100-500 users during MVP testing
- Each blueprint creation uses 1 request (if YouTube URL provided)
- Text input bypasses transcript API entirely
- Monitor usage in dashboard to track quota consumption
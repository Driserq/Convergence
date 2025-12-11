# Supadata API Transcript Extraction - Debug Notes

## Current Status
❌ **YouTube transcript extraction is failing with 404 errors**

## What We Know

### Working Components
✅ Video ID extraction is working correctly  
✅ API key is loaded in the server (present in `.env.local`)  
✅ Server can make HTTP requests to Supadata  
✅ Text content processing works perfectly  
✅ AI blueprint generation works perfectly  

### The Problem
❌ Supadata API returns `404 Not Found` for all video requests  
❌ This happens even for popular videos with known transcripts  

## Investigation Results

### Test 1: Your Video
```bash
Video ID: UovsPd8fDfc
URL: https://www.youtube.com/watch?v=UovsPd8fDfc
Result: 404 Not Found
```

### Test 2: Popular Video (Rick Roll - definitely has captions)
```bash
Video ID: dQw4w9WgXcQ  
URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Result: 404 Not Found
```

### Tested Request Formats
All returned 404:
- `POST /v1/youtube/transcript` with `{"videoId":"..."}`
- `POST /v1/youtube/transcript` with `{"video_id":"..."}`
- `POST /v1/youtube/transcript` with `{"url":"..."}`
- `GET /v1/youtube/transcript/{videoId}`

## Current Implementation

**File**: `src/routes/blueprint.ts`  
**Endpoint**: `https://api.supadata.ai/v1/youtube/transcript`  
**Method**: POST  
**Headers**:
- `Content-Type: application/json`
- `x-api-key: sd_dc2c2e62d8ff6e134f4968f7956beeb5`
**Body**: `{"videoId":"VIDEO_ID"}`

## Possible Causes

1. **API Endpoint Changed**: Supadata may have changed their API URL or version
2. **Request Format Changed**: The expected JSON structure may be different
3. **API Key Issue**: The key might be expired or for a different tier
4. **Service Issue**: Supadata's service might be temporarily down

## Next Steps

### Option 1: Check Supadata Documentation
Visit https://supadata.ai/docs or your Supadata dashboard to verify:
- Current API endpoint URL
- Required request format
- API key status and tier limits
- Any recent API changes

### Option 2: Contact Supadata Support
- Email: support@supadata.ai
- Include: API key, video IDs tested, error messages

### Option 3: Use Alternative Transcript Service
Consider switching to:
- YouTube Transcript API (unofficial)
- youtube-transcript npm package
- AssemblyAI (paid)
- Deepgram (paid)

### Option 4: Manual Transcript Input (Temporary)
For now, users can:
1. Get transcript manually from YouTube
2. Paste it as text content
3. Generate blueprint successfully

## Testing Text Content (Works Now!)

While debugging YouTube, you can test with text:

```
Goal: I want to learn system design
Content Type: Text
Text Content: [Paste any learning content here, min 50 chars]
```

This will work perfectly and generate a full blueprint!

## Code Locations

- **Blueprint API Route**: `src/routes/blueprint.ts` (lines 75-140)
- **YouTube ID Extraction**: `src/lib/youtube.ts`
- **Environment Variables**: `.env.local`
- **Test Page**: `http://localhost:3000/test-blueprint`

## Logs to Monitor

Start server with:
```bash
npm run dev
```

Watch for these log messages:
- `[CreateBlueprint] YouTube URL: ...`
- `[CreateBlueprint] Extracted video ID: ...`
- `[CreateBlueprint] Calling Supadata API...`
- `[CreateBlueprint] Supadata error response: ...`

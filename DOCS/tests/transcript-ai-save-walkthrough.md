# Transcript → AI → Save Verification

## Prerequisites
- Supabase local stack running (`npx supabase start`) with RLS policies enabled on `habit_blueprints`.
- Environment variables set: `SUPADATA_API_KEY`, `GOOGLE_AI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- Development server started (`npm run dev`) so Fastify exposes `/api` routes on port `3001`.

## 1. Obtain Session Tokens
1. Visit `http://localhost:5173/login` and authenticate as **User A** (create via Supabase Auth UI if needed).
2. From browser devtools, copy the `access_token` from `localStorage` (`supabase.auth.token`).
3. Repeat with a second account **User B** for later RLS validation.

## 2. Validate `/api/transcript`
```bash
curl -s \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3001/api/transcript \
  -d '{"youtubeUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' | jq
```
- Expect `success: true`, a non-empty `transcript`, and `metadata.videoId`.
- If the response is an error, confirm Supadata API key and rerun.

## 3. Run `/api/create-blueprint`
```bash
curl -s \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3001/api/create-blueprint \
  -d '{
    "goal":"I want to improve my fitness",
    "contentType":"youtube",
    "youtubeUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }' | jq
```
- Expect `success: true`, a populated `blueprint`, and `savedBlueprint.id`.
- Confirm logs show the transcript extraction and AI generation steps without errors.

## 4. Confirm Persistence for User A
```bash
curl -s \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  http://localhost:3001/api/blueprints | jq '.blueprints[0]'
```
- The latest blueprint should appear with `user_id` matching User A (check via Supabase dashboard if needed).

## 5. Validate RLS Enforcement
```bash
curl -s \
  -H "Authorization: Bearer $USER_B_TOKEN" \
  http://localhost:3001/api/blueprints | jq
```
- Expect an empty `blueprints` array. Any records indicate RLS misconfiguration.

## 6. Optional Cleanup
- Remove test rows from `habit_blueprints` via Supabase SQL editor.
- Stop local services (`npx supabase stop`).

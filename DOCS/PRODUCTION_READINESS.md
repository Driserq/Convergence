# Production Readiness & Migration Guide

This document tracks configuration changes, optimizations, and architectural shifts required when moving Consum from the current MVP/Development environment to a Production environment.

## External Services & API Limits

### Supadata (YouTube Transcripts)
- **Current State**: A hardcoded `1100ms` delay exists in `src/routes/blueprint.ts` between fetching video metadata and extracting transcripts.
- **Reason**: The free/development tier of Supadata has a strict rate limit of **1 request per second**. Since we make two sequential calls (metadata + transcript), this delay prevents `429 Too Many Requests` errors.
- **Production Action**: 
  - If upgrading to a paid Supadata tier (which typically offers higher concurrency), remove this delay to improve blueprint generation speed.
  - Alternatively, implement a proper centralized rate-limiting queue (e.g., using Redis/BullMQ) if high concurrent usage is expected.

## Database & Supabase
- **Service Role Usage**: The app currently relies heavily on `getServiceClient()` (Service Role Key) in API routes.
  - **Production Action**: Audit all service role usages. Ensure RLS policies are robust enough that we can switch to user-impersonated clients where possible, or strictly scope the service role operations.

## Security
- **Environment Variables**: Ensure `.env` values are properly set in the deployment provider (Vercel/Railway/etc.).
- **CORS**: `src/server.ts` currently has permissive CORS settings for development. Lock this down to the specific production domain.

## Performance
- **Gemini Polling**: The retry worker currently polls the database. In a scaled environment, this should be replaced with an event-driven architecture or a dedicated job queue service to reduce database load.

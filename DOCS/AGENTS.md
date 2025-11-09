# Development Rules - Habit Blueprint MVP

## Code Style & Formatting

### TypeScript
- **Strict TypeScript**: Client build (`tsconfig.json`) runs in `strict` mode; server build (`tsconfig.server.json`) is temporarily relaxed—avoid introducing new `any` usages without justification  
- **Type definitions**: Create interfaces for all data structures  
- **Explicit returns**: Always specify function return types  

### File Organization
/src  
/components # Reusable UI components  
/pages # Route/page components  
/lib # Utilities, helpers, API clients  
/types # TypeScript type definitions  
/hooks # Custom React hooks  

### Naming Conventions
- **Components**: PascalCase (e.g., `BlueprintCard.tsx`)  
- **Utilities**: camelCase (e.g., `formatDate.ts`)  
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_VIDEO_DURATION`)  
- **Types/Interfaces**: PascalCase with descriptive names (e.g., `Blueprint`, `UserGoal`)  
- **Imports**: Prefer relative paths; the `@` alias to `src/` exists but should remain unused to keep parity with production builds  

## File Length & Organization
- **Maximum file length**: Target ≤300 lines per file  
- **Component files**: Aim for ≤200 lines — current Landing/Dashboard exceed and must be refactored into smaller pieces  
- **API route files**: One route per file, target ≤150 lines  
- **Utility files**: Group related functions, target ≤250 lines  

## Security Requirements

### Environment Variables
- **Never commit**: `.env`, `.env.local`, `.env.production` stay local  
- **Naming**: Use descriptive UPPER_SNAKE_CASE (e.g., `GOOGLE_AI_API_KEY`)  
- **Required variables**:  
SUPABASE_URL=  
SUPABASE_ANON_KEY=  
GOOGLE_AI_API_KEY=  
NODE_ENV=  

### API Key Handling
- **Server-side only**: Never expose API keys to client  
- **Validation**: Check for required env variables on server startup  
- **Error messages**: Never include API keys in error logs  

### Data Validation
- **Input validation**: Use Zod schemas for all user inputs  
- **Sanitization**: Sanitize YouTube URLs before processing  
- **SQL injection**: Use Supabase client methods (parameterized queries)  

## Error Handling Standards

### Console Logging (MVP Phase)
- **Error format**: `console.error('[ComponentName] Error:', error)`  
- **Info logs**: `console.log('[ComponentName] Info:', message)`  
- **Debugging**: `console.debug('[FunctionName] Debug:', data)`  

### Try-Catch Patterns
try {  
  // Operation  
} catch (error) {  
  console.error('[FunctionName] Error:', error);  
  // Provide user-friendly fallback  
  return { success: false, error: 'User-friendly message' };  
}  

### User Feedback
- **Loading states**: Show loading indicator during async operations  
- **Error messages**: Display simple, actionable messages (e.g., "Invalid YouTube URL")  
- **Success feedback**: Confirm actions completed (e.g., "Blueprint created!")  

## API & External Services

### YouTube Transcript Fetching
- **Service**: Use Supadata.ai REST API (no npm package needed)
- **Duration limit**: Warn users if video > 90 minutes  
- **Error handling**: Catch transcript unavailable errors gracefully
- **API calls**: Server-side HTTP requests only (never expose API key to client)

### Google Gemini API Calls
- **Model**: Use `gemini-2.5-flash` for all processing
- **Context window**: 1M tokens (can handle very long transcripts)
- **Token management**: Monitor token usage in console logs
- **Timeouts**: Set 45-second timeout for AI responses
- **Output structure**: AI must return JSON with two sections:
  - `overview`: Single text block containing summary, mistakes to avoid, and guidance (use \n\n for paragraph breaks)
  - `habits`: Array of 3-5 actionable habit steps (id, title, description, timeframe)

### Supabase Interactions
- **Authentication**: Use `supabase.auth` methods  
- **Database**: Use `supabase.from()` query builder  
- **RLS**: Rely on Row Level Security policies (no manual user filtering needed)  

## Code Comments & Documentation

### When to Comment
- **Complex logic**: Explain "why" not "what"  
- **API integrations**: Document expected inputs/outputs  
- **Workarounds**: Note temporary solutions with `// TODO:` prefix  

### Function Documentation
/**
Generates complete habit blueprint from video transcript  
@param transcript - Full video transcript text  
@param userGoal - User's primary goal  
@returns Object with summary, mistakes, guidance, and action steps  
*/  
async function generateBlueprint(transcript: string, userGoal: string) { ... }  

### Avoid Over-Commenting
- **Self-documenting code**: Prefer clear variable/function names over comments  
- **No obvious comments**: Don't comment trivial code  

## Testing & Development

### Local Testing
- **Full stack**: `npm run dev` performs a one-time Vite client build then watches the Fastify server via `tsx`  
- **Client only**: `npm run dev:client` starts Vite on `http://localhost:5173` (proxies API requests to Fastify `http://localhost:3001`)  
- **Supabase local**: Always test with `npx supabase start` before deploying  
- **Console verification**: Check browser console for errors during testing  
- **Test data**: Use sample YouTube videos (< 30 min) for quick iteration  

### Before Committing
- **TypeScript check**: Ensure no TypeScript errors (`npm run build` must succeed)  
- **Console cleanup**: Remove debug logs (keep error logs)  
- **Env variables**: Verify `.env*` not tracked in git  

## Performance Considerations

### Frontend
- **Lazy loading**: Load components as needed  
- **Debouncing**: Debounce user input (e.g., YouTube URL validation)  
- **Loading states**: Show immediate feedback for all async actions  

### Backend
- **Caching**: Cache YouTube transcripts if fetched multiple times (future optimization)  
- **Rate limiting**: Implement basic rate limiting for AI calls (future)  
- **Async processing**: Don't block UI during AI generation  

## MVP Priorities
1. **Functionality first**: Get core features working  
2. **Console errors**: Monitor and fix errors immediately  
3. **UI polish**: Iterate after core functionality works  
4. **No premature optimization**: Keep it simple until it breaks  

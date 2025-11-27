import { config as loadEnv } from 'dotenv'
import { getServiceClient } from '../src/lib/database'
import { fetchVideoMetadata } from '../src/lib/transcript'

/**
 * One-off utility to populate existing YouTube blueprint titles/durations using Supadata metadata.
 *
 * Usage:
 *   SUPABASE_URL=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   SUPADATA_API_KEY=... \
 *   npx tsx scripts/backfillBlueprintTitles.ts
 */

loadEnv()

const REQUIRED_ENV_VARS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPADATA_API_KEY'] as const
const RATE_LIMIT_DELAY_MS = Number(process.env.SUPADATA_RATE_LIMIT_MS || 1200)

interface BlueprintRow {
  id: string
  goal: string
  content_source: string | null
  title: string | null
  duration: number | null
  author_name: string | null
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function assertEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key] || process.env[key]!.length === 0)
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

async function fetchCandidates() {
  const serviceClient = getServiceClient()
  const { data, error } = await serviceClient
    .from('habit_blueprints')
    .select('id, goal, content_source, title, duration, author_name')
    .eq('content_type', 'youtube')
    .or('title.is.null,title.eq."",author_name.is.null,author_name.eq.""')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as BlueprintRow[]
}

async function updateBlueprint(id: string, updates: Partial<Pick<BlueprintRow, 'title' | 'duration' | 'author_name'>>) {
  const serviceClient = getServiceClient()
  const { error } = await serviceClient
    .from('habit_blueprints')
    .update(updates)
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

async function runBackfill() {
  assertEnv()

  const candidates = await fetchCandidates()

  if (!candidates.length) {
    console.log('[Backfill] No blueprints require updates.')
    return
  }

  console.log(`[Backfill] Found ${candidates.length} blueprint(s) missing titles. Starting updates...`)

  let processed = 0
  let updated = 0

  for (const row of candidates) {
    processed += 1

    if (!row.content_source) {
      console.warn(`[Backfill] Skipping ${row.id}: missing content_source`)
      continue
    }

    try {
      const metadata = await fetchVideoMetadata(row.content_source)
      await sleep(RATE_LIMIT_DELAY_MS)

      if (!metadata?.title && !metadata?.durationSeconds && !metadata?.authorName) {
        console.warn(`[Backfill] No metadata returned for ${row.id} (${row.content_source})`)
        continue
      }

      const updates: Partial<Pick<BlueprintRow, 'title' | 'duration' | 'author_name'>> = {}

      if (metadata?.title) {
        updates.title = metadata.title
      }

      if (metadata?.durationSeconds && (!row.duration || row.duration <= 0)) {
        updates.duration = metadata.durationSeconds
      }

      if (metadata?.authorName && (!row.author_name || row.author_name.trim().length === 0)) {
        updates.author_name = metadata.authorName
      }

      if (!Object.keys(updates).length) {
        console.log(`[Backfill] No updates needed for ${row.id}`)
        continue
      }

      await updateBlueprint(row.id, updates)
      updated += 1
      console.log(`[Backfill] Updated ${row.id} → title="${updates.title ?? row.title}" duration=${updates.duration ?? row.duration} author="${updates.author_name ?? row.author_name ?? ''}"`)
    } catch (error) {
      console.error(`[Backfill] Failed to update ${row.id}:`, error)
    }
  }

  console.log(`[Backfill] Completed. Processed ${processed} records, updated ${updated}.`)
}

runBackfill().catch((error) => {
  console.error('[Backfill] Fatal error:', error)
  process.exit(1)
})

import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { fetchDueRetryJobs } from '../lib/database'
import { processBlueprintJob } from '../lib/geminiProcessor'

const POLL_INTERVAL_MS = 30_000
const BATCH_SIZE = 10

export default fp(async function geminiRetryWorker(fastify: FastifyInstance) {
  let isRunning = false

  const timer = setInterval(async () => {
    if (isRunning) {
      return
    }

    isRunning = true

    try {
      const jobs = await fetchDueRetryJobs(BATCH_SIZE)

      if (!jobs.length) {
        return
      }

      console.log(`[GeminiRetryWorker] Processing ${jobs.length} pending job(s)`) 

      for (const job of jobs) {
        try {
          await processBlueprintJob(job)
        } catch (error) {
          console.error(`[GeminiRetryWorker] Error processing job ${job.id}:`, error)
        }
      }
    } catch (error) {
      console.error('[GeminiRetryWorker] Failed to fetch retry jobs:', error)
    } finally {
      isRunning = false
    }
  }, POLL_INTERVAL_MS)

  fastify.addHook('onClose', async () => {
    clearInterval(timer)
  })

  fastify.log.info('[GeminiRetryWorker] Retry worker initialized')
})

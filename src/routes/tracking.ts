import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  ACTION_TRACKING_QUOTA,
  HABIT_TRACKING_QUOTA,
  BlueprintOwnershipError,
  TrackingLimitError,
  deleteBlueprintCompletion,
  getBlueprintCompletions,
  getTrackedBlueprintsForUser,
  MissingServiceRoleCredentialsError,
  toggleTrackedBlueprint,
  upsertBlueprintCompletion
} from '../lib/database.js'
import { supabase } from '../lib/supabase.server.js'
import type { TrackedSectionType } from '../types/tracking.js'

const toggleTrackingSchema = z.object({
  blueprintId: z.string().min(1),
  trackHabits: z.boolean().optional(),
  trackActions: z.boolean().optional()
}).refine((data) => data.trackHabits !== undefined || data.trackActions !== undefined, {
  message: 'trackHabits or trackActions must be provided'
})

const completionSchema = z.object({
  blueprintId: z.string().min(1),
  sectionType: z.enum(['daily_habit', 'sequential_step', 'decision_checklist']),
  itemId: z.string().min(1),
  completed: z.boolean(),
  completedOn: z.string().optional()
})

type AuthenticatedRequest = FastifyRequest & { user?: { id: string; email?: string | null } }

const HABIT_LIMIT_MESSAGE = 'Maximum 5 blueprints with habits tracked. Untrack habits from another blueprint first.'
const ACTION_LIMIT_MESSAGE = 'Maximum 7 blueprints with action items tracked. Untrack action items from another blueprint first.'

async function requireUser(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ success: false, error: 'Authentication required. Please log in.' })
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    reply.code(401).send({ success: false, error: 'Invalid or expired session. Please log in again.' })
    return null
  }

  return data.user
}

export default async function trackingRoutes(fastify: FastifyInstance) {
  fastify.get('/api/tracking', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = await requireUser(request, reply)
    if (!user) return

    try {
      const [trackedBlueprints, completions] = await Promise.all([
        getTrackedBlueprintsForUser(user.id),
        getBlueprintCompletions(user.id)
      ])

      const counts = trackedBlueprints.reduce(
        (acc, tracked) => {
          if (tracked.trackHabits) acc.habitsTracked += 1
          if (tracked.trackActions) acc.actionsTracked += 1
          return acc
        },
        { habitsTracked: 0, actionsTracked: 0 }
      )

      return reply.send({
        success: true,
        tracked: trackedBlueprints,
        completions,
        counts,
        limits: {
          habits: HABIT_TRACKING_QUOTA,
          actions: ACTION_TRACKING_QUOTA
        }
      })
    } catch (error) {
      if (error instanceof MissingServiceRoleCredentialsError) {
        console.error('[Tracking] Service role credentials missing:', error)
        return reply.code(500).send({ success: false, error: 'Server configuration error. Please contact support.' })
      }

      console.error('[Tracking] Failed to fetch tracking data:', error)
      return reply.code(500).send({ success: false, error: 'Failed to load tracking information' })
    }
  })

  fastify.post('/api/tracking/toggle', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = await requireUser(request, reply)
    if (!user) return

    const validation = toggleTrackingSchema.safeParse(request.body)
    if (!validation.success) {
      return reply.code(400).send({ success: false, error: validation.error.issues[0]?.message ?? 'Invalid payload' })
    }

    try {
      const result = await toggleTrackedBlueprint({
        userId: user.id,
        blueprintId: validation.data.blueprintId,
        trackHabits: validation.data.trackHabits,
        trackActions: validation.data.trackActions
      })

      return reply.send({
        success: true,
        tracked: result.tracked,
        counts: result.counts,
        limits: {
          habits: HABIT_TRACKING_QUOTA,
          actions: ACTION_TRACKING_QUOTA
        }
      })
    } catch (error) {
      if (error instanceof TrackingLimitError) {
        return reply.code(400).send({ success: false, error: error.message })
      }

      if (error instanceof BlueprintOwnershipError) {
        return reply.code(404).send({ success: false, error: 'Blueprint not found or access denied' })
      }

      if (error instanceof MissingServiceRoleCredentialsError) {
        console.error('[Tracking] Service role credentials missing:', error)
        return reply.code(500).send({ success: false, error: 'Server configuration error. Please contact support.' })
      }

      console.error('[Tracking] Failed to toggle tracking:', error)
      return reply.code(500).send({ success: false, error: 'Failed to update tracking preference' })
    }
  })

  fastify.post('/api/tracking/completion', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = await requireUser(request, reply)
    if (!user) return

    const validation = completionSchema.safeParse(request.body)
    if (!validation.success) {
      return reply.code(400).send({ success: false, error: validation.error.issues[0]?.message ?? 'Invalid payload' })
    }

    const { blueprintId, sectionType, itemId, completed, completedOn } = validation.data

    try {
      if (completed) {
        const completion = await upsertBlueprintCompletion({
          userId: user.id,
          blueprintId,
          sectionType: sectionType as TrackedSectionType,
          itemId,
          completedOn
        })

        return reply.send({ success: true, completion })
      }

      await deleteBlueprintCompletion({
        userId: user.id,
        blueprintId,
        sectionType: sectionType as TrackedSectionType,
        itemId,
        completedOn
      })

      return reply.send({ success: true })
    } catch (error) {
      if (error instanceof BlueprintOwnershipError) {
        return reply.code(404).send({ success: false, error: 'Blueprint not found or access denied' })
      }

      if (error instanceof MissingServiceRoleCredentialsError) {
        console.error('[Tracking] Service role credentials missing:', error)
        return reply.code(500).send({ success: false, error: 'Server configuration error. Please contact support.' })
      }

      console.error('[Tracking] Failed to mutate completion:', error)
      return reply.code(500).send({ success: false, error: 'Failed to update completion state' })
    }
  })
}

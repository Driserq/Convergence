import type { FastifyReply, FastifyRequest } from 'fastify'
import { supabase } from '../supabase.server.js'

export interface AuthenticatedUser {
  id: string
  email?: string | null
}

export const requireUser = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<AuthenticatedUser | null> => {
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

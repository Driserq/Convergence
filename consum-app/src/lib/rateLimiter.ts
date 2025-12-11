const submissions = new Map<string, number[]>()

interface RateLimitOptions {
  limit?: number
  windowMs?: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export const checkRateLimit = (userId: string, options: RateLimitOptions = {}): RateLimitResult => {
  const limit = options.limit ?? 10
  const windowMs = options.windowMs ?? ONE_DAY_MS
  const now = Date.now()
  const windowStart = now - windowMs

  const history = submissions.get(userId) ?? []
  const recentHistory = history.filter((timestamp) => timestamp > windowStart)

  if (recentHistory.length >= limit) {
    submissions.set(userId, recentHistory)
    return { allowed: false, remaining: 0 }
  }

  recentHistory.push(now)
  submissions.set(userId, recentHistory)

  return { allowed: true, remaining: Math.max(0, limit - recentHistory.length) }
}


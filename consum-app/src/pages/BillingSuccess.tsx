import React, { useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'
import { Button } from '../components/ui/button'
import { useRouter } from '../contexts/RouterContext'

const getSessionId = (): string | null => {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('session_id')
}

export const BillingSuccess: React.FC = () => {
  const { navigate } = useRouter()
  const { data, isLoading, refresh } = useSubscription()

  useEffect(() => {
    void refresh()
  }, [refresh])

  const sessionId = getSessionId()

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="size-8 text-emerald-500" aria-hidden />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-foreground">Payment successful</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {sessionId
            ? `Checkout session ${sessionId} completed. Your plan will update momentarily.`
            : 'Your subscription update completed. You can start generating blueprints right away.'}
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-left">
          {isLoading || !data ? (
            <p className="text-sm text-muted-foreground">Refreshing your subscription status…</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current plan</p>
              <p className="text-2xl font-semibold text-foreground">{data.planName}</p>
              <p className="text-sm text-muted-foreground">
                {data.usage.used} / {data.usage.limit} blueprints used · resets {new Date(data.periodEnd).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate('dashboard')} className="rounded-full px-6">
            Back to dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('plans')} className="rounded-full px-6">
            Manage plans
          </Button>
        </div>
      </div>
    </div>
  )
}

import React, { useMemo, useState } from 'react'
import { CheckCircle2, ShieldCheck, Sparkles, Zap } from 'lucide-react'

import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useSubscription } from '../hooks/useSubscription'
import type { PlanCode } from '../types/subscription'
import { useRouter } from '../contexts/RouterContext'
import { cn } from '../lib/utils'

type PlanOption = {
  code: PlanCode
  name: string
  price: string
  cadence: string
  limit: string
  description: string
  highlight?: string
  featured?: boolean
  features: string[]
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    code: 'weekly',
    name: 'Weekly Sprint',
    price: '$5',
    cadence: 'per week',
    limit: '20 blueprints weekly · Track up to 3 habits/actions',
    description: 'Stay in motion with capped tracking built for short bursts of focus.',
    highlight: 'Perfect when you only need 3 habits active',
    features: [
      '20 fresh blueprints delivered each week',
      'Track up to 3 habits + action items',
      'Priority weekly refresh cadence',
      'Export-ready summaries for sharing'
    ]
  },
  {
    code: 'monthly',
    name: 'Monthly Builder',
    price: '$10',
    cadence: 'per month',
    limit: '150 blueprints monthly · Track up to 8 habits/actions',
    description: 'Full accountability workspace — more than 8 habits is just ineffective.',
    highlight: 'Most popular for committed operators',
    featured: true,
    features: [
      '150 blueprints every month',
      'Track up to 8 habits + action items',
      'Full accountability workspace access',
      'Priority processing + export packs'
    ]
  }
]

export const Plans: React.FC = () => {
  const { navigate } = useRouter()
  const {
    data,
    isLoading,
    createCheckoutSession,
    changePlan,
    isChangingPlan,
    error: subscriptionError,
    remaining,
    limit,
    used
  } = useSubscription()
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const [pendingPlan, setPendingPlan] = useState<PlanCode | null>(null)

  const currentPlanCode = data?.planCode ?? 'free'

  const quotaSummary = useMemo(() => {
    if (isLoading) {
      return 'Checking usage…'
    }
    if (!data) {
      return 'Usage unavailable'
    }
    if (limit <= 0) {
      return `${used} generated`
    }
    return `${used} / ${limit} generated · ${remaining} remaining`
  }, [data, isLoading, limit, remaining, used])

  const handleSelectPlan = async (planCode: PlanCode) => {
    setSelectionError(null)
    setPendingPlan(planCode)

    const result = await createCheckoutSession(planCode)
    if (!result.success) {
      setPendingPlan(null)
      setSelectionError(result.error || 'Failed to start checkout. Please try again.')
    }
  }

  const handleCancelSubscription = async () => {
    if (currentPlanCode === 'free') return
    setSelectionError(null)
    const result = await changePlan('free')
    if (!result.success) {
      setSelectionError(result.error || 'Failed to cancel subscription. Please try again.')
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
            <header className="rounded-3xl border border-border/70 bg-card/90 p-8 shadow-lg">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-4">
                  <Badge variant="secondary" className="w-fit gap-2">
                    <Sparkles className="size-4 text-primary" aria-hidden />
                    Plans & Pricing
                  </Badge>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Scale your habit operating system</h1>
                    <p className="text-base text-muted-foreground">
                      Unlock higher blueprint limits, expanded action tracking, and faster refresh cycles for your blueprint library.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary-foreground">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Current usage</p>
                  <p className="mt-1 text-base font-semibold text-primary">{quotaSummary}</p>
                  {data?.periodEnd && (
                    <p className="text-xs text-primary/80">Resets {new Date(data.periodEnd).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="size-4" aria-hidden />
                Cancel anytime · No hidden fees · Secured with Stripe
              </div>
            </header>

            {(subscriptionError || selectionError) && (
              <Alert variant="destructive">
                <AlertDescription>{selectionError ?? subscriptionError}</AlertDescription>
              </Alert>
            )}

            <section className="grid gap-6 md:grid-cols-2">
              {PLAN_OPTIONS.map((plan) => {
                const isCurrent = plan.code === currentPlanCode
                const isPending = pendingPlan === plan.code
                const disabled = isCurrent || isPending

                return (
                  <Card
                    key={plan.code}
                    className={cn(
                      'flex h-full flex-col rounded-3xl border border-border/80 bg-card/95 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg',
                      plan.featured && 'border-primary/60 ring-2 ring-primary/20'
                    )}
                  >
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl font-semibold text-foreground">{plan.name}</CardTitle>
                          <CardDescription className="text-base text-muted-foreground">{plan.description}</CardDescription>
                        </div>
                        {plan.featured && (
                          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                            Most Popular
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-4xl font-bold text-foreground">{plan.price}</p>
                        <p className="text-sm text-muted-foreground">{plan.cadence}</p>
                      </div>
                      {plan.highlight && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          <Zap className="size-3.5" aria-hidden />
                          {plan.highlight}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-6">
                      <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
                        {plan.limit}
                      </div>
                      <ul className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 size-4 text-primary" aria-hidden />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="mt-auto flex flex-col gap-3">
                      <Button
                        size="lg"
                        className="w-full rounded-xl"
                        disabled={disabled}
                        onClick={() => handleSelectPlan(plan.code)}
                      >
                        {isCurrent ? 'Current Plan' : isPending ? 'Redirecting…' : 'Upgrade'}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        Billed securely via Stripe. Cancel anytime from your profile.
                      </p>
                    </CardFooter>
                  </Card>
                )
              })}
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/80 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Prefer to stay on Free?</h2>
                  <p className="text-sm text-muted-foreground">
                    Free plan includes 3 monthly blueprints and no habit tracking. Upgrade whenever you need more throughput or accountability.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="rounded-md"
                    disabled={currentPlanCode === 'free' || isChangingPlan}
                    onClick={handleCancelSubscription}
                  >
                    {currentPlanCode === 'free'
                      ? 'Already on Free'
                      : isChangingPlan
                        ? 'Cancelling…'
                        : 'Cancel subscription'}
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

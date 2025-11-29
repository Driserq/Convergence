import React, { useMemo } from 'react'
import { Sparkles, ListChecks } from 'lucide-react'

import { BlueprintForm } from '../components/blueprint/BlueprintForm'
import { Badge } from '../components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card'
import { Separator } from '../components/ui/separator'
import { useSubscription } from '../hooks/useSubscription'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { useRouter } from '../contexts/RouterContext'

export const CreateBlueprintView: React.FC = () => {
  const { navigate } = useRouter()
  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
    error: subscriptionError,
    refresh: refreshSubscription,
    isAtLimit,
    limit,
    used,
    remaining
  } = useSubscription()

  const usageSummary = useMemo(() => {
    if (!subscription) return undefined
    return {
      planName: subscription.planName,
      limit: subscription.usage.limit,
      used: subscription.usage.used,
      remaining: subscription.usage.remaining,
      periodEnd: subscription.periodEnd
    }
  }, [subscription])

  const periodResetLabel = useMemo(() => {
    if (!usageSummary?.periodEnd) return undefined
    return new Date(usageSummary.periodEnd).toLocaleString()
  }, [usageSummary])

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
          <section>
            <Card className="border border-border bg-card shadow-lg">
              <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit gap-2 px-3 py-1 text-xs uppercase tracking-wide">
                    <Sparkles className="size-4" aria-hidden />
                    Blueprint Studio
                  </Badge>
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
                      Generate a New Habit Blueprint
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Transform videos or notes into a sequenced habit plan. Share your goal and source content to begin.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </section>

          <section>
            <Card className="rounded-3xl border border-border bg-card shadow-lg">
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-semibold text-foreground">Blueprint Workspace</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Provide content and goals to generate a personalized habit blueprint in minutes.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6 rounded-2xl border border-border/80 bg-background/90 p-6 shadow-inner">
                  <BlueprintForm
                    isQuotaExceeded={isAtLimit}
                    isSubscriptionLoading={isSubscriptionLoading}
                    onBlueprintCreated={(result) => {
                      if (result.success || result.subscription) {
                        void refreshSubscription()
                      }
                      if (result.queued) {
                        navigate('history')
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-6 rounded-2xl border border-border/60 bg-background/80 p-6">
                  <div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-primary">Subscription status</p>
                      <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                        {subscription?.planName ?? (isSubscriptionLoading ? 'Loading...' : 'Unknown')}
                      </Badge>
                    </div>
                    {isSubscriptionLoading ? (
                      <p className="text-sm text-muted-foreground">Checking your quota...</p>
                    ) : subscription ? (
                      <>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-semibold text-foreground">{used} / {limit}</span>
                          <span className="text-xs font-medium text-primary">{remaining} remaining</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {periodResetLabel ? `Resets ${periodResetLabel}` : 'Active usage window'}
                        </p>
                        {isAtLimit && (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium text-amber-700">
                              You&apos;ve reached your quota. Upgrade to unlock more blueprints.
                            </p>
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white border-none"
                              onClick={() => navigate('plans')}
                            >
                              Upgrade Plan
                            </Button>
                          </div>
                        )}
                        {!isAtLimit && subscription && subscription.planName === 'Free' && (
                           <Button 
                             variant="link" 
                             className="h-auto p-0 text-xs text-primary underline-offset-4"
                             onClick={() => navigate('plans')}
                           >
                             Upgrade to increase limits
                           </Button>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">We couldn&apos;t load your subscription details.</p>
                    )}
                  </div>

                  {subscriptionError && (
                    <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
                      <AlertDescription>{subscriptionError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Blueprint tips</h3>
                    <p className="text-sm text-muted-foreground">
                      Shape better outputs with specific goals, timelines, and context about where you plan to apply the insights.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {[
                      'Mention the skill or habit you want to build.',
                      'Add constraints like available time or resources.',
                      'List blockers you want the blueprint to address.'
                    ].map((tip) => (
                      <div key={tip} className="flex items-start gap-3">
                        <div className="mt-1 flex size-6 items-center justify-center rounded-full bg-primary/10">
                          <ListChecks className="size-3 text-primary" aria-hidden />
                        </div>
                        <p className="text-sm text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">Need a faster start?</p>
                    <p>Import a previous blueprint and iterate once the history view is available.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}

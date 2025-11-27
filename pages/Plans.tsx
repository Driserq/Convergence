import React, { useState } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { Button } from '../src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../src/components/ui/card'
import { Badge } from '../src/components/ui/badge'
import { useSubscription } from '../src/hooks/useSubscription'
import type { PlanCode } from '../src/types/subscription'

export const Plans: React.FC = () => {
  const { createCheckoutSession } = useSubscription()
  const [loadingPlan, setLoadingPlan] = useState<PlanCode | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpgrade = async (planCode: PlanCode) => {
    setLoadingPlan(planCode)
    setError(null)
    
    const result = await createCheckoutSession(planCode)
    
    if (!result.success) {
      setError(result.error || 'Failed to start checkout')
      setLoadingPlan(null)
    }
    // If success, we are redirecting, so loading state persists until page unload
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Upgrade Your Plan
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Unlock higher limits and get more out of Convergence.
          <br />
          Choose the plan that fits your workflow.
        </p>
      </div>

      {error && (
        <div className="mx-auto mt-8 max-w-md rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center">
          {error}
        </div>
      )}

      <div className="mx-auto mt-12 grid max-w-lg gap-8 lg:max-w-none lg:grid-cols-2">
        {/* Weekly Plan */}
        <Card className="relative border-border transition-all hover:border-primary/50 hover:shadow-md flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Weekly
              <Badge variant="outline">7 Days</Badge>
            </CardTitle>
            <CardDescription>Perfect for short-term focus</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">Free</span>
              <span className="text-base font-medium text-muted-foreground">/ week</span>
            </div>
            <p className="text-xs text-muted-foreground">(Test Mode)</p>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-6">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-primary" />
                <span>Higher blueprint limits</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-primary" />
                <span>Weekly quota reset</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-primary" />
                <span>Full access to all features</span>
              </li>
            </ul>
            <Button 
              className="w-full" 
              onClick={() => handleUpgrade('weekly')}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === 'weekly' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Subscribe Weekly'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Plan */}
        <Card className="relative border-primary/50 bg-primary/5 shadow-sm transition-all hover:border-primary hover:shadow-md flex flex-col">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground hover:bg-primary px-3 py-1">
              <Sparkles className="mr-1 h-3 w-3" /> Most Popular
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Monthly
              <Badge variant="outline" className="border-primary/20">30 Days</Badge>
            </CardTitle>
            <CardDescription>Best value for habit building</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">Free</span>
              <span className="text-base font-medium text-muted-foreground">/ month</span>
            </div>
            <p className="text-xs text-muted-foreground">(Test Mode)</p>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-6">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-primary" />
                <span>Highest blueprint limits</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-primary" />
                <span>Monthly quota reset</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-primary" />
                <span>Full access to all features</span>
              </li>
            </ul>
            <Button 
              className="w-full" 
              variant="default"
              onClick={() => handleUpgrade('monthly')}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === 'monthly' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Subscribe Monthly'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

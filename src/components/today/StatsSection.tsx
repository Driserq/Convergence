import React from 'react'
import { Activity, BarChart3, Clock3, TrendingUp } from 'lucide-react'
import { useDashboardStats } from '../../hooks/useDashboardStats'

import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../components/ui/card'
import { cn } from '../../lib/utils'

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${remainingMinutes}m`
}

export const StatsSection: React.FC = () => {
  const { stats, isLoading, refresh } = useDashboardStats()

  const analyticsSummary = [
    {
      title: 'Content Processed',
      value: stats?.blueprints_count.toString() ?? '0',
      description: 'Blueprints created in the last 30 days',
      icon: Activity
    },
    {
      title: 'Time Saved',
      value: formatDuration(stats?.time_saved_seconds ?? 0),
      description: 'Estimated time saved from processing content',
      icon: Clock3
    }
  ]

  const contentRatio = [
    { label: 'YouTube', value: stats?.youtube_ratio ?? 0 },
    { label: 'Text', value: stats?.text_ratio ?? 0 }
  ]

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Your Analytics (Last 30 Days)</h2>
          <p className="text-sm text-muted-foreground">Track how your blueprint workflow evolves over time.</p>
        </div>
        <Button 
          variant="ghost" 
          className="h-10 gap-2 px-4 text-sm"
          onClick={() => refresh()}
          disabled={isLoading}
        >
          <Clock3 className={cn("size-4", isLoading && "animate-spin")} aria-hidden />
          {isLoading ? 'Refreshing...' : 'Refresh data'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-6 sm:grid-cols-2">
          {analyticsSummary.map(({ title, value, description, icon: Icon }) => (
            <Card key={title} className="rounded-2xl border border-border bg-card shadow-sm">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-4 text-primary" aria-hidden />
                  </div>
                  <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
                </div>
                <p className="text-3xl font-semibold text-foreground">{value}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{description}</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Vs last period</span>
                    <span className="text-foreground/80">+0%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted" aria-hidden>
                    <div className="h-2 w-0 rounded-full bg-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="flex flex-col justify-between rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold text-foreground">Content Type Ratio</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Understand which sources fuel your blueprints.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {contentRatio.map(({ label, value }) => (
                <div key={label} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{label}</span>
                    <span className="font-semibold text-foreground">{value}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted" aria-hidden>
                    <div 
                      className="h-2 rounded-full bg-primary transition-all duration-500" 
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="size-5 text-primary" aria-hidden />
                <p className="text-sm font-semibold text-foreground">Coming soon: Blueprint trends</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Track how many blueprints you create each week and the habits they emphasize most.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}


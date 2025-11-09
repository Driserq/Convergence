import React from 'react'
import { Activity, ArrowRight, BarChart3, ClipboardList, Clock3, ListChecks, Sparkles, Target, TrendingUp } from 'lucide-react'

import { BlueprintForm } from '../components/blueprint/BlueprintForm'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card'
import { Separator } from '../components/ui/separator'
import type { BlueprintFormData } from '../types/blueprint'

const QUICK_METRICS = [
  {
    label: 'Blueprints Created',
    value: '0',
    description: 'Create your first blueprint below.',
    icon: ClipboardList
  },
  {
    label: 'Active Habits',
    value: '0',
    description: 'Track your progress (coming soon).',
    icon: Target
  },
  {
    label: 'Success Rate',
    value: '-%',
    description: 'Analytics (coming soon).',
    icon: TrendingUp
  }
]

const ANALYTICS_SUMMARY = [
  {
    title: 'Content Processed',
    value: '0',
    description: 'Blueprints created in the last 30 days',
    icon: Activity
  },
  {
    title: 'Time Saved',
    value: '0h 0m',
    description: 'Estimated time saved from processing content',
    icon: Clock3
  }
]

const CONTENT_RATIO = [
  { label: 'YouTube', value: 0 },
  { label: 'Text', value: 0 }
]

const HOW_IT_WORKS_STEPS = [
  {
    title: 'Set Your Goal',
    description: 'Be specific about what you want to achieve so the AI can tailor the blueprint.',
    icon: Target
  },
  {
    title: 'Add Content Source',
    description: 'Provide a YouTube URL or paste text like articles, transcripts, or notes.',
    icon: ListChecks
  },
  {
    title: 'Get Your Blueprint',
    description: 'We analyze the content and create step-by-step habits aligned with your goal.',
    icon: Sparkles
  },
  {
    title: 'Take Action',
    description: 'Follow the sequential steps, track progress, and iterate as you learn.',
    icon: ArrowRight
  }
]

export const Dashboard: React.FC = () => {
  const handleBlueprintSubmit = async (formData: BlueprintFormData): Promise<void> => {
    console.log('[Dashboard] Blueprint form submitted:', formData)
    
    // TODO: This will be implemented in Phase 4 (YouTube Transcript) and Phase 5 (AI Blueprint Generation)
    // For now, we'll just simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('[Dashboard] Blueprint form processing complete (simulated)')
    
    // In future phases, this will:
    // 1. Extract YouTube transcript (if YouTube URL provided) - Phase 4
    // 2. Generate AI blueprint from content + goals - Phase 5
    // 3. Save blueprint to database - Phase 6
    // 4. Navigate to blueprint result or history - Phase 7
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-12">
          <section className="space-y-6">
            <Card className="border border-border bg-card shadow-lg">
              <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit gap-2 px-3 py-1 text-xs uppercase tracking-wide">
                    <Sparkles className="size-4" aria-hidden />
                    Dashboard
                  </Badge>
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
                      Create Your Habit Blueprint
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Transform any content into actionable habit changes. Start by sharing your goal and the source you want to analyze.
                    </CardDescription>
                  </div>
                </div>
                <Button variant="secondary" className="h-12 gap-2 rounded-full px-6 text-sm font-semibold">
                  <BarChart3 className="size-4" aria-hidden />
                  View history (coming soon)
                </Button>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {QUICK_METRICS.map(({ label, value, description, icon: Icon }) => (
                <Card key={label} className="rounded-2xl border border-border bg-card shadow-sm">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                        <Icon className="size-5 text-primary" aria-hidden />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                        <p className="text-3xl font-semibold text-foreground">{value}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}

              <Card className="rounded-2xl border border-border bg-card shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                      <TrendingUp className="size-5 text-primary" aria-hidden />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Watch Later Conversion
                      </CardTitle>
                      <p className="text-lg font-semibold text-foreground">0%</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>YouTube</span>
                      <span className="text-foreground">0%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted" aria-hidden>
                      <div className="h-2 w-0 rounded-full bg-primary" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Articles</span>
                      <span className="text-foreground">0%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted" aria-hidden>
                      <div className="h-2 w-0 rounded-full bg-primary/60" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Conversion tracking will visualize how many saved items have been transformed into blueprints.
                  </p>
                </CardContent>
              </Card>
            </div>
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
                <Button variant="outline" className="h-10 gap-2 rounded-full px-4 text-sm">
                  <Sparkles className="size-4" aria-hidden />
                  Explore templates (soon)
                </Button>
              </CardHeader>
              <CardContent className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6 rounded-2xl border border-border/80 bg-background/90 p-6 shadow-inner">
                  <BlueprintForm onSubmit={handleBlueprintSubmit} />
                </div>
                <div className="flex flex-col gap-6 rounded-2xl border border-border/60 bg-background/80 p-6">
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
                    <p className="font-semibold text-foreground">Need faster results?</p>
                    <p>Import a previous blueprint and iterate on it once the history view is available.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Your Analytics (Last 30 Days)</h2>
                <p className="text-sm text-muted-foreground">Track how your blueprint workflow evolves over time.</p>
              </div>
              <Button variant="ghost" className="h-10 gap-2 px-4 text-sm">
                <Clock3 className="size-4" aria-hidden />
                Refresh data
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="grid gap-6 sm:grid-cols-2">
                {ANALYTICS_SUMMARY.map(({ title, value, description, icon: Icon }) => (
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
                    {CONTENT_RATIO.map(({ label, value }) => (
                      <div key={label} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{label}</span>
                          <span className="font-semibold text-foreground">{value}%</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-muted" aria-hidden>
                          <div className="h-2 w-0 rounded-full bg-primary" />
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

          <section>
            <Card className="rounded-3xl border border-border bg-card shadow-lg">
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-semibold text-foreground">How It Works</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Follow the four-step path to turn inspiration into structured action.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-4">
                {HOW_IT_WORKS_STEPS.map(({ title, description, icon: Icon }, index) => (
                  <div key={title} className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/80 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="size-5 text-primary" aria-hidden />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Step {index + 1}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-foreground">{title}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}

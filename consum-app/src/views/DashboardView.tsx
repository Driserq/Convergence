import React from 'react'
import { CalendarDays } from 'lucide-react'

import { useTrackedBlueprints } from '../hooks/useTrackedBlueprints'
import { TodayHabitsSection } from '../components/today/TodayHabitsSection'
import { ActionItemsSection } from '../components/today/ActionItemsSection'
import { StatsSection } from '../components/today/StatsSection'
import { Card, CardContent } from '../components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { AppShell } from '../components/layout/AppShell'

export const TodayView: React.FC = () => {
  const {
    isLoading,
    isRefreshing,
    error,
    habitItems,
    actionGroups,
    toggleCompletion,
    loadingCompletionFor
  } = useTrackedBlueprints()

  const today = new Date()
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-background">
      <AppShell className="max-w-6xl gap-12 pb-20 pt-10">
        <section>
          <Card className="border border-border bg-card/95 shadow-lg">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  <CalendarDays className="size-4 text-primary" aria-hidden />
                  Today&apos;s Focus
                </div>
                <h1 className="text-3xl font-semibold text-foreground">{formattedDate}</h1>
                <p className="text-sm text-muted-foreground">
                  Review your tracked habits, action items, and stay on pace with your blueprint goals.
                </p>
              </div>
              {isRefreshing && (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                  Syncing latest progress…
                </span>
              )}
            </CardContent>
          </Card>
        </section>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Unable to load tracking data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <TodayHabitsSection
          items={habitItems}
          isLoading={isLoading}
          loadingMap={loadingCompletionFor}
          onToggle={({ blueprintId, itemId, completed, completedOn }) =>
            toggleCompletion({
              blueprintId,
              itemId,
              completed,
              sectionType: 'daily_habit',
              completedOn,
            })
          }
        />

        <ActionItemsSection
          groups={actionGroups}
          isLoading={isLoading}
          loadingMap={loadingCompletionFor}
          onToggle={({ blueprintId, sectionType, itemId, completed, completedOn }) =>
            toggleCompletion({
              blueprintId,
              sectionType,
              itemId,
              completed,
              completedOn,
            })
          }
        />

        <StatsSection />
      </AppShell>
    </div>
  )
}

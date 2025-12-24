import React from 'react'
import { Check, Clock3, Flame } from 'lucide-react'

import type { HabitDisplayItem } from '../../hooks/useTrackedBlueprints'
import { getLocalISODate } from '../../lib/tracking'

interface TodayHabitsSectionProps {
  items: HabitDisplayItem[]
  isLoading: boolean
  loadingMap: Record<string, boolean>
  onToggle: (options: { blueprintId: string; itemId: string; completed: boolean; completedOn?: string }) => Promise<void>
}

const HabitSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-2xl border border-border/60 bg-background/80 p-4">
    <div className="flex items-start gap-4">
      <div className="h-10 w-10 rounded-full border border-border/60 bg-muted" aria-hidden />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-1/3 rounded bg-muted" aria-hidden />
        <div className="h-3 w-2/3 rounded bg-muted" aria-hidden />
        <div className="flex gap-3">
          <div className="h-3 w-24 rounded bg-muted" aria-hidden />
          <div className="h-3 w-16 rounded bg-muted" aria-hidden />
        </div>
      </div>
    </div>
  </div>
)

export const TodayHabitsSection: React.FC<TodayHabitsSectionProps> = ({ items, isLoading, loadingMap, onToggle }) => {
  const completedCount = items.filter((item) => item.completedToday).length

  // Group items by Blueprint Title -> Section Title
  const groupedItems = React.useMemo(() => {
    const map = new Map<string, Map<string, HabitDisplayItem[]>>()

    items.forEach((item) => {
      if (!map.has(item.blueprintTitle)) {
        map.set(item.blueprintTitle, new Map())
      }
      const sectionMap = map.get(item.blueprintTitle)!
      
      const sectionTitle = item.sectionTitle || 'General Habits'
      if (!sectionMap.has(sectionTitle)) {
        sectionMap.set(sectionTitle, [])
      }
      sectionMap.get(sectionTitle)!.push(item)
    })

    return map
  }, [items])

  const handleToggle = async (item: HabitDisplayItem) => {
    const today = getLocalISODate()
    const todaysCompletion = item.completions.find((completion) => completion.completedOn === today)

    await onToggle({
      blueprintId: item.blueprintId,
      itemId: item.itemId,
      completed: !item.completedToday,
      completedOn: item.completedToday ? (todaysCompletion?.completedOn ?? today) : today
    })
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Today&apos;s Habits</h2>
        <p className="text-sm text-muted-foreground">Mark your daily repetitions to build streaks that stick.</p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <>
            <HabitSkeleton />
            <HabitSkeleton />
            <HabitSkeleton />
          </>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
            No daily habits tracked. Go to Library and enable &quot;Track Habits&quot; on blueprints.
          </div>
        ) : (
          Array.from(groupedItems.entries()).map(([blueprintTitle, sections]) => (
            <div key={blueprintTitle} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">{blueprintTitle}</h3>
              
              {Array.from(sections.entries()).map(([sectionTitle, sectionItems]) => (
                <div key={`${blueprintTitle}-${sectionTitle}`} className="space-y-2">
                   {sectionTitle !== 'General Habits' && (
                      <h4 className="text-xs font-semibold text-primary/70 pl-1 mt-2 mb-1">{sectionTitle}</h4>
                   )}
                   
                   <div className="space-y-3">
                    {sectionItems.map((item) => {
                      const completionKey = `${item.blueprintId}:daily_habit:${item.itemId}`
                      const isPending = Boolean(loadingMap[completionKey])

                      return (
                        <div
                          key={`${item.blueprintId}-${item.itemId}`}
                          className="flex items-start gap-4 rounded-2xl border border-border bg-card/95 p-4 shadow-sm"
                        >
                          <button
                            type="button"
                            aria-label={item.completedToday ? 'Undo habit completion' : 'Mark habit complete'}
                            aria-pressed={item.completedToday}
                            disabled={isPending}
                            onClick={() => handleToggle(item)}
                            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                              item.completedToday
                                ? 'border-transparent bg-primary text-primary-foreground'
                                : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary'
                            } ${isPending ? 'opacity-60' : ''}`}
                          >
                            {item.completedToday ? <Check className="size-5" aria-hidden /> : <span className="size-3 rounded-full bg-muted-foreground/70" />}
                          </button>

                          <div className="flex flex-1 flex-col gap-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="space-y-1">
                                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                              </div>
                              {item.timeframe && (
                                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                                  <Clock3 className="size-3.5" aria-hidden />
                                  {item.timeframe}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              {/* Blueprint title removed from individual card as it's now a header */}
                              {item.streak > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[0.7rem] font-medium text-amber-600">
                                  <Flame className="size-3" aria-hidden />
                                  {item.streak === 1 ? '1 day streak' : `${item.streak}-day streak`}
                                </span>
                              )}
                              {item.completedToday && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[0.7rem] font-medium text-primary">
                                  Completed today
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                   </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {!isLoading && items.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm text-muted-foreground">
          <span>
            {completedCount === 0
              ? 'No habits completed yet today.'
              : `${completedCount} ${completedCount === 1 ? 'habit' : 'habits'} completed today.`}
          </span>
        </div>
      )}
    </section>
  )
}

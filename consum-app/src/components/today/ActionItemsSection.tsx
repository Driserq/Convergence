import React, { useState } from 'react'
import { Check, ChevronDown, ChevronRight, ClipboardList, CircleAlert, Play } from 'lucide-react'

import type { ActionBlueprintGroup } from '../../hooks/useTrackedBlueprints'
import { getLocalISODate } from '../../lib/tracking'
import { cn } from '../../lib/utils'
import { Badge } from '../ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'

interface ActionItemsSectionProps {
  groups: ActionBlueprintGroup[]
  isLoading: boolean
  loadingMap: Record<string, boolean>
  onToggle: (options: { blueprintId: string; sectionType: 'sequential_step' | 'decision_checklist'; itemId: string; completed: boolean; completedOn?: string }) => Promise<void>
}

const GroupSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-2xl border border-border/60 bg-background/80 p-5">
    <div className="flex items-center justify-between">
      <div className="h-4 w-1/4 rounded bg-muted" aria-hidden />
      <div className="h-3 w-20 rounded bg-muted" aria-hidden />
    </div>
    <div className="mt-4 space-y-3">
      <div className="h-3 w-2/3 rounded bg-muted" aria-hidden />
      <div className="h-3 w-1/2 rounded bg-muted" aria-hidden />
      <div className="h-3 w-3/4 rounded bg-muted" aria-hidden />
    </div>
  </div>
)

const CheckboxButton: React.FC<{
  checked: boolean
  disabled?: boolean
  onClick: () => void
  label: string
}> = ({ checked, disabled, onClick, label }) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={checked}
    disabled={disabled}
    onClick={onClick}
    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
      checked
        ? 'border-transparent bg-primary text-primary-foreground'
        : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary'
    } ${disabled ? 'opacity-60' : ''}`}
  >
    {checked ? <Check className="size-4" aria-hidden /> : <span className="size-3 rounded-full bg-muted-foreground/70" />}
  </button>
)

const BlueprintActionGroup: React.FC<{
  group: ActionBlueprintGroup
  loadingMap: Record<string, boolean>
  onToggle: (
    blueprintId: string,
    sectionType: 'sequential_step' | 'decision_checklist',
    itemId: string,
    completed: boolean,
    completedOn?: string
  ) => Promise<void>
}> = ({ group, loadingMap, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false)

  // Calculate remaining counts
  const remainingSteps = group.sequentialSteps.filter(s => !s.completed).length
  const remainingDecisions = group.decisionChecklist.filter(d => !d.completed).length
  const totalRemaining = remainingSteps + remainingDecisions

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-2xl border border-border bg-card/95 shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <ClipboardList className="size-5 text-primary" aria-hidden />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{group.blueprintTitle}</h3>
            <p className="text-xs text-muted-foreground">
              {totalRemaining === 0 
                ? 'All action items completed' 
                : `${totalRemaining} action item${totalRemaining === 1 ? '' : 's'} remaining`
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isOpen && totalRemaining > 0 && (
             <Badge variant="secondary" className="hidden sm:inline-flex">
               {totalRemaining} left
             </Badge>
          )}
          <CollapsibleTrigger asChild>
            <button className="inline-flex size-8 items-center justify-center rounded-full hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              {isOpen ? (
                <ChevronDown className="size-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent>
        <div className="border-t border-border/40 px-5 py-5 space-y-6">
          {group.sequentialSteps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Step By Step</h4>
              <div className="space-y-3">
                {group.sequentialSteps.map((step) => {
                  const key = `${step.blueprintId}:sequential_step:${step.itemId}`
                  const pending = Boolean(loadingMap[key])

                  return (
                    <div key={`${step.blueprintId}-${step.itemId}`} className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/50 p-3 transition-colors hover:bg-background">
                      <CheckboxButton
                        checked={step.completed}
                        disabled={pending}
                        label={step.completed ? 'Undo Step By Step item' : 'Mark Step By Step item complete'}
                        onClick={() => onToggle(step.blueprintId, 'sequential_step', step.itemId, step.completed, step.completedOn)}
                      />
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className={cn("text-sm font-medium", step.completed ? "text-muted-foreground line-through" : "text-foreground")}>
                            {step.title}
                          </p>
                          {step.timeframe && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-muted/40 px-2.5 py-0.5 text-[0.7rem] text-muted-foreground">
                              <Play className="size-3" aria-hidden />
                              {step.timeframe}
                            </span>
                          )}
                        </div>
                        {step.description && <p className="text-sm text-muted-foreground">{step.description}</p>}
                        {step.deliverable && (
                          <p className="text-xs text-muted-foreground/80">Deliverable: {step.deliverable}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {group.decisionChecklist.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Decision Checklist</h4>
              <div className="space-y-3">
                {group.decisionChecklist.map((item) => {
                  const key = `${item.blueprintId}:decision_checklist:${item.itemId}`
                  const pending = Boolean(loadingMap[key])

                  return (
                    <div key={`${item.blueprintId}-${item.itemId}`} className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/50 p-3 transition-colors hover:bg-background">
                      <CheckboxButton
                        checked={item.completed}
                        disabled={pending}
                        label={item.completed ? 'Undo decision checklist item' : 'Mark decision checklist item complete'}
                        onClick={() => onToggle(item.blueprintId, 'decision_checklist', item.itemId, item.completed, item.completedOn)}
                      />
                      <div className="flex flex-1 flex-col gap-1">
                        <p className={cn("text-sm font-medium", item.completed ? "text-muted-foreground line-through" : "text-foreground")}>
                          {item.question}
                        </p>
                        {item.weight && <p className="text-xs text-muted-foreground/80">Weight: {item.weight}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {group.triggerActions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Trigger Playbooks</h4>
              <div className="space-y-3">
                {group.triggerActions.map((trigger) => (
                  <div key={`${trigger.blueprintId}-${trigger.itemId}`} className="flex flex-col gap-2 rounded-xl border border-border/50 bg-background/40 p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                      <CircleAlert className="size-3.5 text-primary" aria-hidden />
                      {trigger.situation}
                    </div>
                    <p className="text-sm text-foreground">{trigger.action}</p>
                    {trigger.timeframe && (
                      <span className="text-xs text-muted-foreground/80">Suggested timing: {trigger.timeframe}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export const ActionItemsSection: React.FC<ActionItemsSectionProps> = ({ groups, isLoading, loadingMap, onToggle }) => {
  const handleToggle = async (
    blueprintId: string,
    sectionType: 'sequential_step' | 'decision_checklist',
    itemId: string,
    completed: boolean,
    completedOn?: string
  ) => {
    await onToggle({
      blueprintId,
      sectionType,
      itemId,
      completed: !completed,
      completedOn: completed ? completedOn : getLocalISODate()
    })
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Action Items</h2>
          <p className="text-sm text-muted-foreground">Step By Step items, decision checks, and trigger playbooks from tracked blueprints.</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <GroupSkeleton />
            <GroupSkeleton />
          </>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
            No action items tracked. Go to Library and enable &quot;Track Action Items&quot; on blueprints.
          </div>
        ) : (
          groups.map((group) => (
            <BlueprintActionGroup
              key={group.blueprintId}
              group={group}
              loadingMap={loadingMap}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>
    </section>
  )
}

import React from 'react'
import { OverviewCard } from './OverviewCard'
import { SequentialSteps } from './SequentialSteps'
import { DailyHabits } from './DailyHabits'
import { TriggerActions } from './TriggerActions'
import { DecisionChecklist } from './DecisionChecklist'
import { ResourceList } from './ResourceList'
import type { AIBlueprint } from '../../types/blueprint'
import { isLegacyBlueprintOutput, isAdaptiveBlueprintOutput } from '../../types/blueprint'

interface BlueprintDetailProps {
  blueprint: AIBlueprint
}

export const BlueprintDetail: React.FC<BlueprintDetailProps> = ({ blueprint }) => {
  // Handle backward compatibility with legacy format
  if (isLegacyBlueprintOutput(blueprint)) {
    console.log('[BlueprintDetail] Rendering legacy blueprint format')
    return (
      <div className="blueprint-container max-w-5xl mx-auto px-4 py-8">
        {/* Legacy Overview Card */}
        <OverviewCard overview={blueprint.overview} />
        
        {/* Legacy Habits as Daily Habits */}
        {blueprint.habits && blueprint.habits.length > 0 && (
          <DailyHabits habits={blueprint.habits.map(habit => ({
            id: habit.id,
            title: habit.title,
            description: habit.description,
            timeframe: habit.timeframe
          }))} />
        )}
      </div>
    )
  }

  // Adaptive blueprint format
  console.log('[BlueprintDetail] Rendering adaptive blueprint format')
  console.log('[BlueprintDetail] Available sections:', Object.keys(blueprint))

  return (
    <div className="blueprint-container max-w-5xl mx-auto px-4 py-8">
      {/* Overview Card - Always displayed */}
      <OverviewCard overview={blueprint.overview} />

      {/* Sequential Steps - Only if populated */}
      {blueprint.sequential_steps && blueprint.sequential_steps.length > 0 && (
        <SequentialSteps steps={blueprint.sequential_steps} />
      )}

      {/* Daily Habits - Only if populated */}
      {blueprint.daily_habits && blueprint.daily_habits.length > 0 && (
        <DailyHabits habits={blueprint.daily_habits} />
      )}

      {/* Trigger Actions - Only if populated */}
      {blueprint.trigger_actions && blueprint.trigger_actions.length > 0 && (
        <TriggerActions actions={blueprint.trigger_actions} />
      )}

      {/* Decision Checklist - Only if populated */}
      {blueprint.decision_checklist && blueprint.decision_checklist.length > 0 && (
        <DecisionChecklist questions={blueprint.decision_checklist} />
      )}

      {/* Resources - Only if populated */}
      {blueprint.resources && blueprint.resources.length > 0 && (
        <ResourceList resources={blueprint.resources} />
      )}
    </div>
  )
}

import React from 'react'
import type { Blueprint } from '../../types/blueprint'
import { BlueprintDisplay } from '../blueprint/display/BlueprintDisplay'
import { DeleteBlueprintDialog } from '../blueprint/DeleteBlueprintDialog'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'

interface BlueprintCardProps {
  blueprint: Blueprint
  onNavigateToDetail: (id: string) => void
  onDelete: (id: string) => Promise<void>
}

export function BlueprintCard({ blueprint, onNavigateToDetail, onDelete }: BlueprintCardProps) {
  const handleOpen = () => {
    if (blueprint.status === 'completed') {
      onNavigateToDetail(blueprint.id)
    }
  }

  return (
    <div className="mb-4">
      <BlueprintDisplay
        blueprint={blueprint.ai_output}
        variant="summary"
        metadata={{
          goal: blueprint.goal,
          createdAt: blueprint.created_at,
          status: blueprint.status,
          contentType: blueprint.content_type,
          contentSource: blueprint.content_source,
        }}
        onNavigateToDetail={blueprint.status === 'completed' ? handleOpen : undefined}
        actionLabel="Open Blueprint"
        summaryFooterExtra={
          <DeleteBlueprintDialog
            blueprintGoal={blueprint.goal}
            onConfirm={() => onDelete(blueprint.id)}
            trigger={
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 min-w-[110px] text-destructive border-destructive/40 hover:bg-destructive/10 flex items-center justify-center"
              >
                Delete
              </Button>
            }
          />
        }
      />
    </div>
  )
}

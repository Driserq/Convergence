import React from 'react'
import type { Blueprint } from '../../types/blueprint'
import { BlueprintDisplay } from '../blueprint/display/BlueprintDisplay'

interface BlueprintCardProps {
  blueprint: Blueprint
  onNavigateToDetail: (id: string) => void
  footerLeft?: React.ReactNode
  footerActions?: React.ReactNode
}

export function BlueprintCard({ blueprint, onNavigateToDetail, footerLeft, footerActions }: BlueprintCardProps) {
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
          title: blueprint.title ?? undefined,
          duration: blueprint.duration ?? undefined,
          authorName: blueprint.author_name ?? undefined
        }}
        onNavigateToDetail={blueprint.status === 'completed' ? handleOpen : undefined}
        actionLabel="Open Blueprint"
        summaryFooterLeft={footerLeft}
        summaryFooterExtra={footerActions}
      />
    </div>
  )
}

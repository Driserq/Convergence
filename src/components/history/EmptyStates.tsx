import React from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty'

interface EmptyBlueprintsProps {
  onCreateBlueprint: () => void
}

export function EmptyBlueprints({ onCreateBlueprint }: EmptyBlueprintsProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Plus className="h-8 w-8" />
        </EmptyMedia>
        <EmptyTitle>No blueprints yet</EmptyTitle>
        <EmptyDescription>
          Get started by creating your first blueprint
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreateBlueprint} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Blueprint
        </Button>
      </EmptyContent>
    </Empty>
  )
}

interface NoSearchResultsProps {
  onClearSearch: () => void
}

export function NoSearchResults({ onClearSearch }: NoSearchResultsProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search className="h-8 w-8" />
        </EmptyMedia>
        <EmptyTitle>No blueprints match your search</EmptyTitle>
        <EmptyDescription>
          Try adjusting your filters or clearing the search
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onClearSearch} variant="outline" className="gap-2">
          Clear Search
        </Button>
      </EmptyContent>
    </Empty>
  )
}

// Loading skeleton for blueprint cards
export function BlueprintCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3 rounded-md border p-4 mb-4">
      <div className="flex items-center gap-2">
        <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
    </div>
  )
}

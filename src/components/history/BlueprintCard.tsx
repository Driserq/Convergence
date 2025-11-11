import React, { useState } from 'react'
import type { Blueprint } from '../../types/blueprint'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { AlertCircle, ChevronDown, ChevronUp, ExternalLink, Loader2 } from 'lucide-react'
import { formatDate, parseOverview, getHabitsOrSteps, getOverviewPreview } from './utils'

interface BlueprintCardProps {
  blueprint: Blueprint
  onNavigateToDetail: (id: string) => void
}

export function BlueprintCard({ blueprint, onNavigateToDetail }: BlueprintCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isReady = blueprint.status === 'completed' && !!blueprint.ai_output
  const isFailed = blueprint.status === 'failed'
  
  const { summary, mistakes, guidance } = parseOverview(blueprint.ai_output)
  const habits = getHabitsOrSteps(blueprint.ai_output)
  const preview = getOverviewPreview(blueprint.ai_output)

  const toggleExpand = () => {
    if (!isReady) return
    setIsExpanded(!isExpanded)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isReady) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleExpand()
    }
  }

  const renderStatusBadge = () => {
    if (isReady) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Ready
        </Badge>
      )
    }

    if (isFailed) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Failed
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        Processing
      </Badge>
    )
  }

  return (
    <Card className="mb-4 transition-all duration-200 hover:shadow-md">
      {/* Collapsed Header - Always Visible */}
      <CardHeader
        className={`pb-4 ${isReady ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={toggleExpand}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={`blueprint-content-${blueprint.id}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Badge and Title */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={blueprint.content_type === 'youtube' ? 'default' : 'secondary'}>
                {blueprint.content_type === 'youtube' ? 'YouTube' : 'Text Input'}
              </Badge>
              {renderStatusBadge()}
              <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">
                {blueprint.goal}
              </h2>
            </div>
            
            {/* Date */}
            <p className="text-sm text-gray-500 mb-2">
              Created: {formatDate(blueprint.created_at)}
            </p>
            
            {/* Preview Text (only when collapsed) */}
            {!isExpanded && isReady && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {preview}
              </p>
            )}
            {!isReady && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                {isFailed ? (
                  <AlertCircle className="h-4 w-4 text-red-500" aria-hidden />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" aria-hidden />
                )}
                <span>
                  {isFailed ? 'Processing failed. Please try again.' : 'Processing your blueprint...'}
                </span>
              </div>
            )}
          </div>
          
          {/* Toggle Button */}
          <button
            className={`ml-4 p-2 rounded-full transition-colors ${isReady ? 'hover:bg-gray-100' : 'opacity-40 pointer-events-none'}`}
            aria-label={isExpanded ? 'Collapse blueprint' : 'Expand blueprint'}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </CardHeader>

      {/* Expanded Content */}
      {isExpanded && isReady && (
        <CardContent
          id={`blueprint-content-${blueprint.id}`}
          className="pt-0 space-y-4 animate-in fade-in duration-200"
        >
          {/* Overview Section - Blue */}
          {summary && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📝 Overview</h3>
              <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
            </div>
          )}

          {/* Mistakes Section - Red */}
          {mistakes.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Mistakes to Avoid</h3>
              <ul className="space-y-1">
                {mistakes.map((mistake, idx) => (
                  <li key={idx} className="text-red-800 text-sm flex gap-2">
                    <span className="text-red-600">•</span>
                    <span className="flex-1">{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Guidance Section - Green */}
          {guidance.length > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ Guidance for Success</h3>
              <ul className="space-y-1">
                {guidance.map((tip, idx) => (
                  <li key={idx} className="text-green-800 text-sm flex gap-2">
                    <span className="text-green-600">•</span>
                    <span className="flex-1">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Habits/Steps Section - Purple */}
          {habits.length > 0 && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-3">🎯 Action Steps</h3>
              <ol className="space-y-3">
                {habits.map((habit) => (
                  <li key={habit.id} className="text-purple-800 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-purple-900 mt-0.5">
                        {habit.id}.
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-purple-900 mb-1">
                          {habit.title}
                        </p>
                        <p className="text-purple-700 mb-1">
                          {habit.description}
                        </p>
                        {habit.timeframe && (
                          <Badge 
                            variant="outline" 
                            className="bg-purple-100 text-purple-800 border-purple-300 text-xs"
                          >
                            {habit.timeframe}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* View Full Blueprint Button */}
          <div className="pt-2 flex justify-end">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onNavigateToDetail(blueprint.id)
              }}
              variant="default"
              className="gap-2"
            >
              View Full Blueprint
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

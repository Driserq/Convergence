import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Clock3, ExternalLink, UserRound } from 'lucide-react'

import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { BlueprintDisplay } from '../components/blueprint/display/BlueprintDisplay'
import { DeleteBlueprintDialog } from '../components/blueprint/DeleteBlueprintDialog'
import { useRouteParams, useRouter } from '../contexts/RouterContext'
import type { Blueprint } from '../types/blueprint'
import { supabase } from '../lib/supabase'
import { buildRoute } from '../routes/map'
import { formatBlueprintDate, type BlueprintSection } from '../lib/blueprint-display'

const STATUS_LABELS: Record<Blueprint['status'], string> = {
  completed: 'Ready',
  pending: 'Processing',
  failed: 'Failed',
}

const STATUS_BADGES: Record<Blueprint['status'], string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
}

const ACTION_FIRST_SECTION_ORDER: Array<BlueprintSection['id']> = [
  'decision_checklist',
  'daily_habits',
  'sequential_steps',
  'trigger_actions',
  'resources',
  'overview',
  'habits',
]

const formatDuration = (seconds?: number | null): string | null => {
  if (!seconds || seconds <= 0) return null
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${remainingMinutes}m`
}

export const BlueprintDetailView: React.FC = () => {
  const { id } = useRouteParams<'blueprintDetail'>()
  const { navigate } = useRouter()

  const [record, setRecord] = useState<Blueprint | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchBlueprint = async () => {
      setLoading(true)
      setError(null)
      setNotFound(false)

      const { data, error } = await supabase
        .from('habit_blueprints')
        .select('id, goal, content_source, content_type, status, created_at, ai_output, title, duration, author_name')
        .eq('id', id)
        .single()

      if (!isMounted) return

      if (error) {
        const noRows = error.code === 'PGRST116' || error.message?.toLowerCase().includes('no rows')
        if (noRows) {
          setNotFound(true)
          setRecord(null)
        } else {
          console.error('[BlueprintDetailView] Failed to load blueprint', error)
          setError('Unable to load this blueprint right now. Please try again later.')
        }
        setLoading(false)
        return
      }

      setRecord(data as Blueprint)
      setLoading(false)
    }

    fetchBlueprint()

    return () => {
      isMounted = false
    }
  }, [id])

  const renderLoadingState = () => (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 w-full rounded-3xl" />
      <Skeleton className="h-72 w-full rounded-3xl" />
    </div>
  )

  const renderErrorState = (message: string) => (
    <Alert variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="ghost" onClick={() => navigate('history')} className="gap-2">
          <ArrowLeft className="size-4" aria-hidden />
          Back to History
        </Button>
      </div>
    </Alert>
  )

  const renderNotFoundState = () => (
    <Alert>
      <AlertTitle>Blueprint not found</AlertTitle>
      <AlertDescription>
        This blueprint either doesn&apos;t exist or you no longer have access to it.
      </AlertDescription>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="ghost" onClick={() => navigate('history')} className="gap-2">
          <ArrowLeft className="size-4" aria-hidden />
          Back to History
        </Button>
      </div>
    </Alert>
  )

  const renderMetadataCard = (blueprint: Blueprint) => {
    const statusLabel = STATUS_LABELS[blueprint.status]
    const statusClass = STATUS_BADGES[blueprint.status]
    const isYouTube = blueprint.content_type === 'youtube'
    const displayTitle = blueprint.title || blueprint.goal
    const durationLabel = formatDuration(blueprint.duration)

    return (
      <Card className="rounded-3xl border border-border bg-card shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold text-foreground">
                {displayTitle}
              </CardTitle>
              {blueprint.author_name && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground/90">
                  <UserRound className="size-4 text-muted-foreground/70" aria-hidden />
                  <span>{blueprint.author_name}</span>
                </p>
              )}
              {blueprint.title && blueprint.title !== blueprint.goal && (
                <p className="text-sm font-medium text-primary/80">Goal: {blueprint.goal}</p>
              )}
              <CardDescription className="text-sm text-muted-foreground">
                Created {formatBlueprintDate(blueprint.created_at)}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`text-xs ${statusClass}`}>
                {statusLabel}
              </Badge>
              <Badge variant={isYouTube ? 'default' : 'secondary'} className="text-xs">
                {isYouTube ? 'YouTube Source' : 'Text Input'}
              </Badge>
              {durationLabel && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3" aria-hidden />
                  {durationLabel}
                </Badge>
              )}
              <DeleteBlueprintDialog
                blueprintGoal={blueprint.goal}
                onConfirm={async () => {
                  const { error: deleteError } = await supabase
                    .from('habit_blueprints')
                    .delete()
                    .eq('id', blueprint.id)

                  if (deleteError) {
                    throw deleteError
                  }

                  navigate('history')
                }}
                trigger={
                  <Button type="button" variant="ghost" className="text-destructive">
                    Delete
                  </Button>
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Blueprint ID</p>
                <code className="mt-2 block w-full break-all rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {blueprint.id}
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source</p>
              {isYouTube && blueprint.content_source ? (
                <a
                  href={blueprint.content_source}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary underline"
                >
                  <ExternalLink className="size-4" aria-hidden />
                  Open original video
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {blueprint.content_source || 'Text input provided manually.'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate('history')} className="gap-2">
            <ArrowLeft className="size-4" aria-hidden />
            Back to History
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const renderStatusAlert = (blueprint: Blueprint) => {
    if (blueprint.status === 'completed') {
      return null
    }

    if (blueprint.status === 'pending') {
      return (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTitle>Blueprint is still generating</AlertTitle>
          <AlertDescription className="text-sm text-amber-900/90">
            Leave this page open or revisit the history tab. We&apos;ll update the blueprint automatically once it&apos;s ready.
          </AlertDescription>
        </Alert>
      )
    }

    return (
      <Alert variant="destructive">
        <AlertTitle>Blueprint processing failed</AlertTitle>
        <AlertDescription>
          This blueprint didn&apos;t finish generating. Try running it again from the dashboard when you&apos;re ready.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            {loading && renderLoadingState()}

            {!loading && error && renderErrorState(error)}

            {!loading && !error && notFound && renderNotFoundState()}

            {!loading && !error && !notFound && record && (
              <>
                {renderMetadataCard(record)}
                {renderStatusAlert(record)}
                <BlueprintDisplay
                  blueprint={record.ai_output}
                  variant="detail"
                  sectionOrder={ACTION_FIRST_SECTION_ORDER}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

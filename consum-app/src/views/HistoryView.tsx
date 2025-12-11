import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import type { Blueprint } from '../types/blueprint'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { Alert, AlertDescription } from '../components/ui/alert'
import { supabase } from '../lib/supabase'
import { useRouter } from '../contexts/RouterContext'
import { BlueprintCard } from '../components/history/BlueprintCard'
import { ControlsBar } from '../components/history/ControlsBar'
import { EmptyBlueprints, NoSearchResults, BlueprintCardSkeleton } from '../components/history/EmptyStates'
import { DeleteBlueprintDialog } from '../components/blueprint/DeleteBlueprintDialog'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useTrackedBlueprints } from '../hooks/useTrackedBlueprints'
import { cn } from '../lib/utils'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination'
import { searchInBlueprint } from '../components/history/utils'
import { AppShell } from '../components/layout/AppShell'

const PAGE_SIZE = 10

type FilterType = 'all' | 'youtube' | 'text'
type SortOrder = 'newest' | 'oldest' | 'alphabetical'

export const HistoryView: React.FC = () => {
  const router = useRouter()
  const {
    tracked,
    toggleTracking,
    loadingTrackingFor
  } = useTrackedBlueprints()
  
  // State
  const [blueprints, setBlueprints] = useState<Blueprint[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Controls
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [actionError, setActionError] = useState<string | null>(null)
  const [retryingBlueprintId, setRetryingBlueprintId] = useState<string | null>(null)
  
  // Computed
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const trackingMap = useMemo(() => {
    const map = new Map<string, { trackHabits: boolean; trackActions: boolean }>()
    tracked.forEach((record) => {
      map.set(record.blueprintId, {
        trackHabits: record.trackHabits,
        trackActions: record.trackActions
      })
    })
    return map
  }, [tracked])

  // Fetch blueprints from Supabase
  const fetchBlueprints = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options
    try {
      if (!silent) {
        setLoading(true)
      }
      setError(null)

      // For search, fetch ALL matching data first (no pagination yet)
      // This allows client-side JSONB search to work correctly
      const shouldSearchAll = searchQuery.trim().length > 0

      // Build query with filters and sort
      let query = supabase
        .from('habit_blueprints')
        .select('id, goal, content_source, content_type, status, created_at, ai_output, title, duration, author_name, video_type', { count: 'exact' })

      // Apply content type filter
      if (filterType !== 'all') {
        query = query.eq('content_type', filterType)
      }

      // Apply server-side search on goal and content_source
      const trimmedSearch = searchQuery.trim()
      if (trimmedSearch) {
        const searchCondition = isUuid(trimmedSearch)
          ? `goal.ilike.%${trimmedSearch}%,content_source.ilike.%${trimmedSearch}%,id.eq.${trimmedSearch}`
          : `goal.ilike.%${trimmedSearch}%,content_source.ilike.%${trimmedSearch}%,id.ilike.%${trimmedSearch}%`

        query = query.or(searchCondition)
      }

      // Apply sort order
      switch (sortOrder) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'alphabetical':
          query = query.order('goal', { ascending: true })
          break
      }

      // If NOT searching, apply pagination now
      // If searching, we'll paginate client-side after JSONB filtering
      if (!shouldSearchAll) {
        const startIdx = (currentPage - 1) * PAGE_SIZE
        const endIdx = startIdx + PAGE_SIZE - 1
        query = query.range(startIdx, endIdx)
      }

      // Execute query
      const { data, error: fetchError, count } = await query

      if (fetchError) {
        console.error('[History] Supabase error:', fetchError)
        setError('Failed to load blueprints. Please try again.')
        setBlueprints([])
        setTotalCount(0)
        return
      }

      let allData = data || []

      // Apply client-side search on ai_output JSONB for complete coverage
      if (trimmedSearch) {
        allData = allData.filter((bp) => {
          // Check if search query appears in goal or content_source (already done server-side)
          // But also check within ai_output JSONB for complete search
          const goal = bp.goal?.toLowerCase() || ''
          const source = bp.content_source?.toLowerCase() || ''
          const idValue = bp.id?.toLowerCase() || ''
          const query = trimmedSearch.toLowerCase()
          
          // If already matched by server search, include it
          if (goal.includes(query) || source.includes(query) || idValue.includes(query)) {
            return true
          }
          
          // Otherwise check ai_output JSONB
          return searchInBlueprint(bp.ai_output, searchQuery)
        })
      }

      // Client-side pagination if we fetched all data
      let paginatedData = allData
      let actualCount = allData.length
      
      if (shouldSearchAll) {
        const startIdx = (currentPage - 1) * PAGE_SIZE
        const endIdx = startIdx + PAGE_SIZE
        paginatedData = allData.slice(startIdx, endIdx)
        actualCount = allData.length
      } else {
        actualCount = count || 0
      }

      setBlueprints(paginatedData)
      setTotalCount(actualCount)
    } catch (err: any) {
      console.error('[History] Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
      setBlueprints([])
      setTotalCount(0)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [searchQuery, filterType, sortOrder, currentPage])

  const handleDeleteBlueprint = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('habit_blueprints')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('[History] Failed to delete blueprint:', deleteError)
        throw deleteError
      }

      setBlueprints((prev) => prev.filter((bp) => bp.id !== id))
      setTotalCount((prev) => Math.max((prev ?? 0) - 1, 0))

      // If current page becomes empty after deletion, refetch to adjust pagination
      if (blueprints.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => Math.max(prev - 1, 1))
      } else {
        await fetchBlueprints({ silent: true })
      }
    } catch (err) {
      console.error('[History] Unexpected error while deleting blueprint:', err)
      setActionError('Failed to delete blueprint. Please try again.')
    }
  }, [blueprints.length, currentPage, fetchBlueprints])

  const handleRetryBlueprint = useCallback(async (id: string) => {
    try {
      setActionError(null)
      setRetryingBlueprintId(id)

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session?.access_token) {
        throw new Error('Please log in again to retry this blueprint.')
      }

      const response = await fetch(`/api/blueprints/${id}/retry`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        }
      })

      if (!response.ok) {
        let payload: any = null
        try {
          payload = await response.json()
        } catch (_) {
          // ignore parse errors
        }
        const message = payload?.error || `Retry request failed (HTTP ${response.status}).`
        throw new Error(message)
      }

      await fetchBlueprints({ silent: true })
    } catch (err: any) {
      console.error('[History] Failed to retry blueprint:', err)
      setActionError(err instanceof Error ? err.message : 'Failed to retry blueprint. Please try again.')
    } finally {
      setRetryingBlueprintId(null)
    }
  }, [fetchBlueprints])

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchBlueprints()
  }, [fetchBlueprints])

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterType, sortOrder])

  // Handlers
  const handleNavigateToDetail = (id: string) => {
    router.navigate('blueprintDetail', { id })
  }

  const handleCreateBlueprint = () => {
    router.navigate('createBlueprint')
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setFilterType('all')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderTrackButtons = (blueprint: Blueprint) => {
    const trackedState = trackingMap.get(blueprint.id)
    const isHabitsTracked = Boolean(trackedState?.trackHabits)
    const isActionsTracked = Boolean(trackedState?.trackActions)
    const isTrackingPending = Boolean(loadingTrackingFor[blueprint.id])
    const canTrack = blueprint.status === 'completed'

    const toggle = async (type: 'habits' | 'actions') => {
      setActionError(null)
      const payload =
        type === 'habits'
          ? { trackHabits: !isHabitsTracked }
          : { trackActions: !isActionsTracked }

      const result = await toggleTracking({
        blueprintId: blueprint.id,
        ...payload
      })

      if (!result.success) {
        setActionError(result.error ?? 'Failed to update tracking. Please try again.')
      }
    }

    const buildClasses = (active: boolean) =>
      cn(
        'rounded-md border-border/60 text-xs font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary border-primary/40 hover:bg-primary/20'
          : 'text-muted-foreground hover:text-primary hover:border-primary/40'
      )

    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={buildClasses(isHabitsTracked)}
          disabled={!canTrack || isTrackingPending}
          onClick={() => toggle('habits')}
        >
          {isHabitsTracked ? 'Tracking Habits' : 'Track Habits'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={buildClasses(isActionsTracked)}
          disabled={!canTrack || isTrackingPending}
          onClick={() => toggle('actions')}
        >
          {isActionsTracked ? 'Tracking Actions' : 'Track Actions'}
        </Button>
        <DeleteBlueprintDialog
          blueprintGoal={blueprint.goal}
          onConfirm={() => handleDeleteBlueprint(blueprint.id)}
          trigger={
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-md border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              Delete
            </Button>
          }
        />
      </div>
    )
  }

  const renderCardActions = (blueprint: Blueprint) => {
    if (blueprint.status === 'failed') {
      const isRetrying = retryingBlueprintId === blueprint.id
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="gap-2 rounded-md"
            onClick={() => handleRetryBlueprint(blueprint.id)}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Retrying...
              </>
            ) : (
              'Retry'
            )}
          </Button>
          <DeleteBlueprintDialog
            blueprintGoal={blueprint.goal}
            onConfirm={() => handleDeleteBlueprint(blueprint.id)}
            trigger={
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-md border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                Delete
              </Button>
            }
          />
        </div>
      )
    }

    return renderTrackButtons(blueprint)
  }

  const renderFooterLeft = (blueprintId: string) => {
    const trackedState = trackingMap.get(blueprintId)
    const badgeConfigs = [
      {
        key: 'habits',
        label: 'Habits tracked',
        isActive: Boolean(trackedState?.trackHabits),
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700'
      },
      {
        key: 'actions',
        label: 'Actions tracked',
        isActive: Boolean(trackedState?.trackActions),
        className: 'border-sky-200 bg-sky-50 text-sky-700'
      }
    ]

    const badges = badgeConfigs
      .filter((config) => config.isActive)
      .map((config) => (
        <Badge key={config.key} variant="outline" className={config.className}>
          {config.label}
        </Badge>
      ))

    if (!badges.length) {
      badges.push(
        <Badge key="inactive" variant="outline" className="border-border/70 bg-muted/40 text-muted-foreground">
          No tracking
        </Badge>
      )
    }

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">{badges}</div>
      </div>
    )
  }

  // Render pagination
  const hasPendingBlueprints = blueprints.some((bp) => bp.status === 'pending')

  useEffect(() => {
    if (!hasPendingBlueprints) {
      return
    }

    const interval = setInterval(() => {
      fetchBlueprints({ silent: true })
    }, 15000)

    return () => clearInterval(interval)
  }, [hasPendingBlueprints, fetchBlueprints])

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first, last, current, and nearby pages
      pages.push(1)
      if (currentPage > 3) pages.push('ellipsis')
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {pages.map((page, idx) => (
            <PaginationItem key={`page-${idx}`}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AppShell className="max-w-6xl gap-8 pb-24 pt-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Blueprint History
              </h1>
              <p className="text-lg text-muted-foreground" aria-live="polite">
                {loading ? 'Loading...' : `${totalCount} ${totalCount === 1 ? 'blueprint' : 'blueprints'} created`}
              </p>
            </div>

            {/* Controls Bar */}
          <ControlsBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onFilterChange={setFilterType}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />

          {actionError && (
            <div className="mt-4">
              <Alert variant="destructive">
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            </div>
          )}

            {/* Content Area */}
            <div className="mt-6">
              {/* Loading State */}
              {loading && (
                <div>
                  <BlueprintCardSkeleton />
                  <BlueprintCardSkeleton />
                  <BlueprintCardSkeleton />
                  <BlueprintCardSkeleton />
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Empty State - No blueprints at all */}
              {!loading && !error && totalCount === 0 && !searchQuery && filterType === 'all' && (
                <EmptyBlueprints onCreateBlueprint={handleCreateBlueprint} />
              )}

              {/* No Search Results State */}
              {!loading && !error && blueprints.length === 0 && (searchQuery || filterType !== 'all') && (
                <NoSearchResults onClearSearch={handleClearSearch} />
              )}

              {/* Blueprint List */}
              {!loading && !error && blueprints.length > 0 && (
                <div>
                  {blueprints.map((blueprint) => (
                    <LazyBlueprintCard key={blueprint.id}>
                      <BlueprintCard
                        blueprint={blueprint}
                        onNavigateToDetail={handleNavigateToDetail}
                        footerLeft={renderFooterLeft(blueprint.id)}
                            footerActions={renderCardActions(blueprint)}
                      />
                    </LazyBlueprintCard>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && !error && blueprints.length > 0 && renderPagination()}
        </AppShell>
      </div>
    </ProtectedRoute>
  )
}

const isUuid = (value: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

const LazyBlueprintCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isVisible) return
    const node = containerRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '200px 0px', threshold: 0.1 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [isVisible])

  return <div ref={containerRef}>{isVisible ? children : <BlueprintCardSkeleton />}</div>
}

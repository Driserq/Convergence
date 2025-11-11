import React, { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import type { Blueprint } from '../types/blueprint'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { Navigation } from '../components/ui/Navigation'
import { Alert, AlertDescription } from '../components/ui/alert'
import { supabase } from '../lib/supabase'
import { useRouter } from '../contexts/RouterContext'
import { BlueprintCard } from '../components/history/BlueprintCard'
import { ControlsBar } from '../components/history/ControlsBar'
import { EmptyBlueprints, NoSearchResults, BlueprintCardSkeleton } from '../components/history/EmptyStates'
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

const PAGE_SIZE = 10

type FilterType = 'all' | 'youtube' | 'text'
type SortOrder = 'newest' | 'oldest' | 'alphabetical'

export const HistoryView: React.FC = () => {
  const router = useRouter()
  
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
  
  // Computed
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

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
      let query = supabase.from('habit_blueprints').select('*', { count: 'exact' })

      // Apply content type filter
      if (filterType !== 'all') {
        query = query.eq('content_type', filterType)
      }

      // Apply server-side search on goal and content_source
      if (searchQuery.trim()) {
        query = query.or(`goal.ilike.%${searchQuery}%,content_source.ilike.%${searchQuery}%`)
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
      if (searchQuery.trim()) {
        allData = allData.filter((bp) => {
          // Check if search query appears in goal or content_source (already done server-side)
          // But also check within ai_output JSONB for complete search
          const goal = bp.goal?.toLowerCase() || ''
          const source = bp.content_source?.toLowerCase() || ''
          const query = searchQuery.toLowerCase()
          
          // If already matched by server search, include it
          if (goal.includes(query) || source.includes(query)) {
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
    router.navigate('dashboard')
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setFilterType('all')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <Navigation />
        
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
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

            {hasPendingBlueprints && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Pending blueprints refresh automatically every 15 seconds. Leave this tab open and we&apos;ll update the status for you.
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
                    <BlueprintCard
                      key={blueprint.id}
                      blueprint={blueprint}
                      onNavigateToDetail={handleNavigateToDetail}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && !error && blueprints.length > 0 && renderPagination()}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

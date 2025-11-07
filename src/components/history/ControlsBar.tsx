import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'

type FilterType = 'all' | 'youtube' | 'text'
type SortOrder = 'newest' | 'oldest' | 'alphabetical'

interface ControlsBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filterType: FilterType
  onFilterChange: (filter: FilterType) => void
  sortOrder: SortOrder
  onSortChange: (sort: SortOrder) => void
}

const DEBOUNCE_MS = 300

export function ControlsBar({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  sortOrder,
  onSortChange,
}: ControlsBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch)
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [localSearch, onSearchChange])

  // Sync with external search query changes (e.g., clear search)
  useEffect(() => {
    if (searchQuery !== localSearch) {
      setLocalSearch(searchQuery)
    }
  }, [searchQuery])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setLocalSearch('')
      onSearchChange('')
    }
  }

  const filterLabels: Record<FilterType, string> = {
    all: 'All Types',
    youtube: 'YouTube Only',
    text: 'Text Only',
  }

  const sortLabels: Record<SortOrder, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    alphabetical: 'Alphabetical',
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="flex-1 space-y-2">
        <Label htmlFor="search-blueprints" className="sr-only">
          Search blueprints
        </Label>
        <div className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-blueprints"
            className="bg-background pl-9"
            placeholder="Search blueprints..."
            type="search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label="Search blueprints by goal, content, or overview"
          />
        </div>
      </div>

      {/* Filter and Sort Dropdowns */}
      <div className="flex gap-2">
        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[140px]" aria-label="Filter blueprints">
              Filter: {filterLabels[filterType]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onFilterChange('all')}
              className={filterType === 'all' ? 'bg-gray-100' : ''}
            >
              All Types
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange('youtube')}
              className={filterType === 'youtube' ? 'bg-gray-100' : ''}
            >
              YouTube Only
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange('text')}
              className={filterType === 'text' ? 'bg-gray-100' : ''}
            >
              Text Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[160px]" aria-label="Sort blueprints">
              Sort: {sortLabels[sortOrder]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onSortChange('newest')}
              className={sortOrder === 'newest' ? 'bg-gray-100' : ''}
            >
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange('oldest')}
              className={sortOrder === 'oldest' ? 'bg-gray-100' : ''}
            >
              Oldest First
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange('alphabetical')}
              className={sortOrder === 'alphabetical' ? 'bg-gray-100' : ''}
            >
              Alphabetical
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

# History Page Design Document

## Purpose
Let users browse their previously generated habit blueprints with powerful search, filter, sort, and pagination capabilities. Provides quick in-card preview with expandable categorized sections and seamless navigation to full detail views.

## Page Structure

### Layout Hierarchy
```
ProtectedRoute
└── Navigation (existing component)
└── Page Container
    ├── Header Section
    │   ├── H1: "Blueprint History"
    │   └── Subtitle: "{count} blueprints created"
    ├── Controls Bar
    │   ├── Search Input (with icon)
    │   ├── Filter Dropdown (All | YouTube | Text)
    │   └── Sort Dropdown (Newest | Oldest | Alphabetical)
    ├── Content Area
    │   ├── Loading State → Skeleton Cards
    │   ├── Error State → Alert Component
    │   ├── Empty State → No blueprints CTA
    │   ├── No Results State → Clear search CTA
    │   └── Blueprint Cards List (collapsed by default)
    └── Pagination Footer (10 items per page)
```

## Components Required

### New Components from KiboUI (Level 3 Patterns)
| Pattern | Level 1 | Level 2 | Level 3 | Browse URL | Purpose |
|---------|---------|---------|---------|------------|----------|
| Search Input | input | types | pattern-input-types-4 | https://www.kibo-ui.com/patterns/input/types/input-types-4 | Search blueprints |
| Loading Cards | skeleton | card | pattern-skeleton-card-3 | https://www.kibo-ui.com/patterns/skeleton/card/skeleton-card-3 | Loading placeholders |
| Page Navigation | pagination | basic | pattern-pagination-basic-5 | https://www.kibo-ui.com/patterns/pagination/basic/pagination-basic-5 | Navigate pages |
| Empty State | empty | actions | pattern-empty-actions-1 | https://www.kibo-ui.com/patterns/empty/actions/empty-actions-1 | No blueprints CTA |

**Pattern URL Format**: `https://www.kibo-ui.com/patterns/{level1}/{level2}/{pattern-name}`

### Existing Components (Reuse from /src/components/ui/)
- ✅ **card.tsx** - Blueprint card containers
- ✅ **accordion.tsx** - Expandable content sections
- ✅ **badge.tsx** - Content type chips (YouTube/Text)
- ✅ **button.tsx** - View details, CTAs
- ✅ **dropdown-menu.tsx** - Filter and sort controls
- ✅ **alert.tsx** - Error messages
- ✅ **separator.tsx** - Visual dividers
- ✅ **Navigation.tsx** - Header with auth

## Data Layer

### Database Table
**Table**: `habit_blueprints`
**Security**: RLS enabled (no manual user_id filters needed)

**Columns**:
- `id` (UUID)
- `user_id` (UUID) - Filtered by RLS
- `goal` (TEXT)
- `habits_to_kill` (TEXT[])
- `habits_to_develop` (TEXT[])
- `content_source` (TEXT) - YouTube URL or "Text Input"
- `content_type` (VARCHAR) - 'youtube' | 'text'
- `ai_output` (JSONB) - Contains overview, habits/steps
- `created_at` (TIMESTAMPTZ)

### Search Strategy
**Phase 1 (MVP)**: Hybrid server + client search
- **Server**: `.or()` query on `goal` and `content_source` with `ilike`
- **Client**: Additional filter on stringified `ai_output` JSONB for complete coverage

**Phase 2 (Future)**: Full-text search with tsvector index

### Query Parameters
- **Filter**: content_type ('all' | 'youtube' | 'text')
- **Sort**: 
  - Newest: `created_at DESC` (default)
  - Oldest: `created_at ASC`
  - Alphabetical: `goal ASC`
- **Search**: Case-insensitive partial match across goal, content_source, ai_output
- **Pagination**: 10 items per page, server-side range queries

## Blueprint Card Design

### Collapsed View (Default)
```
┌─────────────────────────────────────────────────────┐
│ [YouTube Badge]  Goal Title                    [▼] │
│ Created: Oct 22, 2025                               │
│ Preview: First 100 chars of overview with fade...  │
└─────────────────────────────────────────────────────┘
```

**Interaction**: Click anywhere on card or arrow to expand

### Expanded View (On Click)
```
┌─────────────────────────────────────────────────────┐
│ [YouTube Badge]  Goal Title                    [▲] │
│ Created: Oct 22, 2025                               │
│                                                     │
│ ┌─ Overview ────────────────────────────────────┐  │
│ │ [Blue box: bg-blue-50 border-blue-200]        │  │
│ │ Summary paragraph text here...                │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ ┌─ Mistakes to Avoid ───────────────────────────┐  │
│ │ [Red box: bg-red-50 border-red-200]           │  │
│ │ • Mistake 1                                   │  │
│ │ • Mistake 2                                   │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ ┌─ Guidance for Success ────────────────────────┐  │
│ │ [Green box: bg-green-50 border-green-200]     │  │
│ │ • Guidance 1                                  │  │
│ │ • Guidance 2                                  │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ ┌─ Action Steps ────────────────────────────────┐  │
│ │ [Purple box: bg-purple-50 border-purple-200]  │  │
│ │ 1. **Step Title** - Description               │  │
│ │    [Week 1] badge                             │  │
│ │ 2. **Step Title** - Description               │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ [View Full Blueprint Button →]                      │
└─────────────────────────────────────────────────────┘
```

**Animation**: Smooth vertical expansion with fade transition (200ms)

## Component Files Structure

```
src/
├── pages/
│   └── History.tsx (main page, <300 lines)
├── components/
│   └── history/
│       ├── BlueprintCard.tsx (expandable card component)
│       ├── ControlsBar.tsx (search, filter, sort)
│       ├── EmptyStates.tsx (no data, no results)
│       └── utils.ts (date formatting, parsing helpers)
└── types/
    └── blueprint.ts (already exists, reuse types)
```

## State Management

### History Page State
```typescript
interface HistoryPageState {
  // Data
  blueprints: Blueprint[]
  totalCount: number
  totalPages: number
  
  // UI State
  loading: boolean
  error: string | null
  
  // Controls
  searchQuery: string
  filterType: 'all' | 'youtube' | 'text'
  sortOrder: 'newest' | 'oldest' | 'alphabetical'
  currentPage: number
}
```

### Constants
```typescript
const PAGE_SIZE = 10
const DEBOUNCE_MS = 300
```

## Behavior Specifications

### Search
- **Debounced**: 300ms delay after user stops typing
- **Scope**: Goal, content source, and full ai_output text
- **Reset**: Return to page 1 on search query change
- **Keyboard**: Escape key clears search
- **Auto-focus**: Search input focused on mount

### Filter & Sort
- **Default**: Filter = 'All', Sort = 'Newest'
- **Reset**: Return to page 1 on filter/sort change
- **Persistence**: State cleared on page unmount (no URL params in MVP)

### Pagination
- **Size**: 10 items per page
- **Display**: Show current page, total pages
- **Navigation**: Previous, page numbers, Next
- **Disabled**: Previous on page 1, Next on last page

### Card Expansion
- **Default**: All cards collapsed
- **Toggle**: Click anywhere on card header OR arrow icon
- **Keyboard**: Enter/Space to toggle
- **Animation**: Smooth height transition with content fade
- **State**: Independently managed per card

### Navigation to Detail
- **Trigger**: "View Full Blueprint" button in expanded card
- **Route**: `/blueprints/{blueprint.id}`
- **Method**: SPA navigation via `useRouter().navigate()`
- **No reload**: Client-side routing only

## Accessibility

### ARIA Attributes
- `role="button"` on card headers
- `aria-expanded` on toggle buttons
- `aria-controls` linking header to content
- `aria-label` on filter/sort dropdowns
- `aria-live="polite"` on results count

### Keyboard Navigation
- Tab order: Search → Filter → Sort → Cards → Pagination
- Enter/Space: Toggle card expansion
- Escape: Clear search query
- Arrow keys: Navigate pagination (optional)

### Semantic HTML
- `<h1>` for page title
- `<h2>` for each blueprint goal
- `<button>` for all interactive controls
- `<nav>` for pagination
- Proper heading hierarchy

### Focus Management
- Search input auto-focused on mount
- Visible focus rings on all interactive elements
- Focus trap in expanded cards (optional)

## Responsive Design

### Desktop (≥1024px)
- Two-column controls bar (search left, filter/sort right)
- Cards full width with generous padding
- Pagination centered with full numbers visible

### Tablet (768px–1023px)
- Single-column controls bar (stacked)
- Cards maintain readability
- Pagination shows fewer page numbers

### Mobile (<768px)
- Controls stack vertically
- Search full width
- Cards compact padding
- Pagination simplified (Prev/Next only)
- Expanded content boxes maintain colors and structure

## Error Handling

### Network Errors
- Display alert component with message
- Console.error with context: `[History] Error:...`
- Retry button in alert (optional)

### Empty States
1. **No Blueprints Total**:
   - Title: "No blueprints yet"
   - Subtitle: "Get started by creating your first blueprint"
   - CTA: "Create Blueprint" → `/dashboard`

2. **No Search Results**:
   - Title: "No blueprints match your search"
   - Subtitle: "Try adjusting your filters or clearing the search"
   - CTA: "Clear Search" → resets query and filters

### Loading States
- Show 3–4 skeleton cards while fetching
- Skeleton pattern: pattern-skeleton-card-3

## Technical Notes

### Imports
- **CRITICAL**: Use relative paths ONLY: `../../lib/supabase`, `../ui/button`
- **NEVER** use `src/` prefix: `src/lib/utils` or `src/components/ui/button` will break Vite builds
- SSR-friendly: No "use client" directives
- Type imports: `type { Blueprint } from '../types/blueprint'`

**Example correct imports:**
```typescript
// From /src/pages/History.tsx
import { supabase } from '../lib/supabase'           // ✅
import { Button } from '../components/ui/button'     // ✅
import type { Blueprint } from '../types/blueprint'  // ✅

// From /src/components/history/BlueprintCard.tsx  
import { Card } from '../ui/card'                    // ✅
import { formatDate } from './utils'                 // ✅
```

### Supabase RLS
- ✅ **DO**: Let RLS handle user filtering automatically
- ❌ **DON'T**: Add manual `.eq('user_id', user.id)` filters

### Performance
- Debounced search to reduce queries
- Server-side pagination (not client-side filtering)
- Count query with same filters as data query
- Cleanup useEffect timers on unmount

### Dark Theme Compatibility
- Use existing Tailwind conventions:
  - Backgrounds: `bg-gray-900`, `bg-gray-800`
  - Text: `text-white`, `text-gray-300`
  - Borders: `border-gray-700`
  - Hover: `hover:bg-gray-700`

## File Size Limits
- **History.tsx**: <300 lines (split to helpers if needed)
- **BlueprintCard.tsx**: <200 lines
- **ControlsBar.tsx**: <150 lines
- **EmptyStates.tsx**: <100 lines

## Testing Scenarios

### Data Scenarios
1. ✅ Page with 20+ blueprints (pagination works)
2. ✅ Empty database (shows empty state)
3. ✅ Search with no results (shows no-results state)
4. ✅ Mix of YouTube and Text blueprints

### Interaction Scenarios
1. ✅ Search by goal keyword
2. ✅ Filter by content type
3. ✅ Sort by date and alphabetically
4. ✅ Expand/collapse cards smoothly
5. ✅ Navigate to blueprint detail page
6. ✅ Pagination forward and backward
7. ✅ Clear search with Escape key

### Responsive Scenarios
1. ✅ Desktop 1920x1080 (full layout)
2. ✅ Tablet 768x1024 (stacked controls)
3. ✅ iPhone SE 375x667 (mobile optimized)

### Error Scenarios
1. ✅ Network failure (shows alert)
2. ✅ Malformed data (graceful fallback)
3. ✅ Empty ai_output fields (skip empty sections)

## Phase 2 Improvements (Future)

### Full-Text Search
- Add `searchable_text` generated column
- Create GIN index on tsvector
- Use `.textSearch()` for relevance ranking

### Advanced Filters
- Date range picker
- Tags/categories
- Content length filter

### Bulk Actions
- Multi-select cards
- Batch delete
- Export multiple blueprints

### Analytics
- Track "View Full Blueprint" clicks
- Record search queries (privacy-safe)
- Blueprint engagement metrics

---

## Success Criteria

### Functional
- ✅ Fetches blueprints from Supabase with RLS
- ✅ Search works across goal, source, and ai_output
- ✅ Filter by content type (All/YouTube/Text)
- ✅ Sort by newest, oldest, alphabetical
- ✅ Pagination with 10 items per page
- ✅ Cards expand/collapse smoothly
- ✅ Colored sections for overview, mistakes, guidance, steps
- ✅ Navigation to `/blueprints/:id` works without reload
- ✅ Empty and no-results states display correctly
- ✅ Loading skeletons shown while fetching

### Non-Functional
- ✅ All components under file size limits
- ✅ No TypeScript errors or `any` types
- ✅ Accessible keyboard navigation
- ✅ Responsive on mobile, tablet, desktop
- ✅ Dark theme compatible
- ✅ Console errors only for actual errors
- ✅ Debounced search reduces unnecessary queries

---

**Last Updated**: 2025-10-22
**Status**: Ready for implementation
**Next Page**: Profile Management (with Delete Account)

# KiboUI Pattern URL Format Reference

## URL Structure

All KiboUI patterns follow this URL format:

```
https://www.kibo-ui.com/patterns/{level1}/{level2}/{pattern-name}
```

### Components:
- **Base URL**: `https://www.kibo-ui.com/patterns/`
- **Level 1**: Component category (e.g., `button`, `input`, `card`)
- **Level 2**: Variation type (e.g., `standard`, `outline`, `validation`)
- **Pattern Name**: Full pattern identifier from registry (e.g., `button-standard-5`)

---

## Pattern Name to URL Conversion

### Format Rule:
`pattern-{level1}-{level2}-{number}` → `https://www.kibo-ui.com/patterns/{level1}/{level2}/pattern-{level1}-{level2}-{number}`

### Examples:

| Pattern Name | Level 1 | Level 2 | Browse URL |
|--------------|---------|---------|------------|
| `pattern-button-standard-5` | button | standard | https://www.kibo-ui.com/patterns/button/standard/button-standard-5 |
| `pattern-input-types-4` | input | types | https://www.kibo-ui.com/patterns/input/types/input-types-4 |
| `pattern-card-standard-2` | card | standard | https://www.kibo-ui.com/patterns/card/standard/card-standard-2 |
| `pattern-skeleton-card-3` | skeleton | card | https://www.kibo-ui.com/patterns/skeleton/card/skeleton-card-3 |
| `pattern-empty-actions-1` | empty | actions | https://www.kibo-ui.com/patterns/empty/actions/empty-actions-1 |
| `pattern-pagination-basic-5` | pagination | basic | https://www.kibo-ui.com/patterns/pagination/basic/pagination-basic-5 |
| `pattern-switch-cards-1` | switch | cards | https://www.kibo-ui.com/patterns/switch/cards/switch-cards-1 |
| `pattern-alert-info-2` | alert | info | https://www.kibo-ui.com/patterns/alert/info/alert-info-2 |

---

## How to Generate URLs

### Method 1: From Pattern Name
If you know the pattern name (e.g., `pattern-input-types-4`):

1. Remove `pattern-` prefix: `input-types-4`
2. Split by first two hyphens: `input` / `types` / `4`
3. Reconstruct: `https://www.kibo-ui.com/patterns/input/types/input-types-4`

### Method 2: From Level 1 & Level 2
If you know Level 1 (category) and Level 2 (variation):

1. Category page: `https://www.kibo-ui.com/patterns/{level1}` (shows all variations)
2. Variation page: `https://www.kibo-ui.com/patterns/{level1}/{level2}` (shows all patterns)
3. Specific pattern: `https://www.kibo-ui.com/patterns/{level1}/{level2}/{pattern-name}`

---

## Common Categories & Variations

### Buttons
- `button/standard` - Default button styles
- `button/outline` - Outlined buttons
- `button/destructive` - Danger/delete actions
- `button/secondary` - Secondary actions
- `button/link` - Link-styled buttons

### Forms
- `input/standard` - Basic text inputs
- `input/types` - Different input types (search, email, etc.)
- `input/validation` - With validation states
- `form/validation` - Complete forms with validation
- `form/layouts` - Multi-column form layouts

### Cards & Containers
- `card/standard` - Basic card layouts
- `skeleton/card` - Loading placeholders for cards
- `empty/actions` - Empty states with CTAs
- `empty/search` - No search results states

### Navigation
- `pagination/basic` - Simple pagination
- `pagination/advanced` - Feature-rich pagination
- `navigation-menu/standard` - Top navigation menus
- `breadcrumb/standard` - Breadcrumb navigation

### Feedback
- `alert/info` - Information alerts
- `alert/error` - Error messages
- `alert/success` - Success confirmations
- `alert/warning` - Warning messages
- `sonner/standard` - Toast notifications

---

## Usage in Page Builder Workflow

When presenting pattern options to users, always format like this:

```markdown
Please browse the patterns and tell me which ones you want to use:

**For Search Input:**
- Browse: https://www.kibo-ui.com/patterns/input/types/input-types-4
- Pattern: `pattern-input-types-4`

**For Loading Cards:**
- Browse: https://www.kibo-ui.com/patterns/skeleton/card/skeleton-card-3
- Pattern: `pattern-skeleton-card-3`

**For Pagination:**
- Browse: https://www.kibo-ui.com/patterns/pagination/basic/pagination-basic-5
- Pattern: `pattern-pagination-basic-5`
```

### Template:
```
- Browse: https://www.kibo-ui.com/patterns/{level1}/{level2}/{pattern-name}
- Pattern: `{pattern-name}`
```

---

## Quick Reference: History Page Patterns

The patterns used in the History page implementation:

| Component | URL |
|-----------|-----|
| Search Input | https://www.kibo-ui.com/patterns/input/types/input-types-4 |
| Loading Skeleton | https://www.kibo-ui.com/patterns/skeleton/card/skeleton-card-3 |
| Pagination | https://www.kibo-ui.com/patterns/pagination/basic/pagination-basic-5 |
| Empty State | https://www.kibo-ui.com/patterns/empty/actions/empty-actions-1 |

---

## Testing URLs

To verify a URL is correct:
1. The URL should load a live preview of the pattern
2. You should see the pattern name in the page title
3. There should be a "Preview" and "Code" toggle
4. The pattern should match what you expect from the name

**Example working URL:**
https://www.kibo-ui.com/patterns/switch/cards/switch-cards-1

**Signs of incorrect URL:**
- 404 error page
- Shows different component than expected
- URL doesn't match pattern name structure

---

**Last Updated**: 2025-10-22  
**Project**: Consum (Fastify/React + KiboUI)

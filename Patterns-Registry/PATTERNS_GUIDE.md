# Kibo UI Patterns Guide

This guide lists all **53 parent component categories** available in your private registry (`@my-patterns`).

Each category contains multiple variations/patterns. Use the MCP search tool to explore specific variations.

## Registry Information

- **Total Patterns**: 1,105
- **Registry Name**: `@my-patterns`
- **URL**: `http://localhost:3000/r/{name}.json`

---

## How to Use

### Search for a category:
```bash
# Find all button patterns
mcp search "@my-patterns" "button"

# Find all form patterns
mcp search "@my-patterns" "form"

# Find all chart patterns
mcp search "@my-patterns" "chart"
```

### Install a pattern:
```bash
npx shadcn@latest add @my-patterns/pattern-button-destructive-1
```

---

## Available Component Categories (53)

### 1. **accordion** (~21 patterns)
Accordion/collapsible sections with different trigger styles, icons, and layouts.
- Variations: form, multi-level, standard, subtitle, tabs

### 2. **alert** (~25 patterns)
Alert messages for errors, warnings, info, and success states.
- Variations: error, info, standard, success, warning

### 3. **alert-dialog** (~39 patterns)
Modal dialogs for confirmations, destructive actions, and forms.
- Variations: confirmation, custom-actions, destructive, form, informational, success

### 4. **aspect-ratio** (~7 patterns)
Container components that maintain specific aspect ratios.
- Variations: standard

### 5. **avatar** (~14 patterns)
User avatar components in different shapes and sizes.
- Variations: square, standard

### 6. **badge** (~20 patterns)
Small status/label badges with different styles.
- Variations: destructive, outline, secondary, standard

### 7. **breadcrumb** (~14 patterns)
Navigation breadcrumbs with various separators and icons.
- Variations: home-icon, standard

### 8. **button** (~35 patterns)
Button components with different variants and states.
- Variations: destructive, link, outline, secondary, standard

### 9. **button-group** (~39 patterns)
Grouped buttons for toolbars, actions, and navigation.
- Variations: actions, advanced, badges, display, forms, interactive, media, navigation, patterns, standard

### 10. **calendar** (~16 patterns)
Date picker calendars with dialogs and different layouts.
- Variations: dialog, standard

### 11. **card** (~4 patterns)
Card containers for content organization.
- Variations: standard

### 12. **carousel** (~4 patterns)
Image/content carousels with navigation.
- Variations: standard

### 13. **chart** (~70 patterns)
Data visualization charts (area, bar, line, pie, radar, radial).
- Variations: area, bar, line, pie, radar, radial, tooltip

### 14. **checkbox** (~12 patterns)
Checkbox inputs with labels and states.
- Variations: standard

### 15. **collapsible** (~23 patterns)
Collapsible sections for FAQs, cards, and sidebars.
- Variations: card, faq, outline, sidebar, standard

### 16. **combobox** (~42 patterns)
Searchable dropdown selects with autocomplete.
- Variations: custom-actions, grouped, multi-select, rich-content, standard, with-states

### 17. **command** (~21 patterns)
Command palettes and keyboard shortcuts.
- Variations: dialog, popover, standard

### 18. **context-menu** (~27 patterns)
Right-click context menus for different scenarios.
- Variations: canvas, file, standard, table, text

### 19. **data-table** (~8 patterns)
Complex data tables with sorting and filtering.
- Variations: advanced, standard

### 20. **date-picker** (~8 patterns)
Date/time input pickers.
- Variations: standard

### 21. **dialog** (~17 patterns)
Modal dialogs for forms and content.
- Variations: standard

### 22. **drawer** (~22 patterns)
Side drawers from all directions.
- Variations: bottom, left, right, top

### 23. **dropdown-menu** (~30 patterns)
Dropdown menus for actions, profiles, and settings.
- Variations: actions, editor, profile, settings, standard, support

### 24. **empty** (~22 patterns)
Empty state components for no data/results.
- Variations: actions, data, search, standard

### 25. **field** (~38 patterns)
Form field wrappers with labels and validation.
- Variations: advanced, basic-inputs, layouts, selects, text-areas, toggles

### 26. **form** (~42 patterns)
Complete form layouts with validation.
- Variations: advanced, basic-forms, layouts, multi-field, patterns, validation

### 27. **hover-card** (~20 patterns)
Popover cards shown on hover.
- Variations: info, preview, profile, stats

### 28. **input** (~24 patterns)
Text input fields with different types.
- Variations: special, standard, types, validation

### 29. **input-group** (~39 patterns)
Input fields with addons (icons, buttons, labels).
- Variations: ai, buttons, custom, dropdown, icons, label, spinner, text, textarea, tooltip

### 30. **input-otp** (~20 patterns)
One-time password input fields.
- Variations: behavior, standard

### 31. **item** (~10 patterns)
List item components.
- Variations: standard

### 32. **kbd** (~39 patterns)
Keyboard shortcut displays.
- Variations: advanced, modifier-keys, shortcuts, special-keys, standard

### 33. **label** (~8 patterns)
Form labels with different styles.
- Variations: standard

### 34. **menubar** (~10 patterns)
Application menubars (like File, Edit, View).
- Variations: standard

### 35. **navigation-menu** (~20 patterns)
Navigation menus with dropdowns.
- Variations: standard

### 36. **pagination** (~19 patterns)
Pagination controls for lists/tables.
- Variations: standard

### 37. **popover** (~15 patterns)
Popover tooltips with rich content.
- Variations: standard

### 38. **progress** (~20 patterns)
Progress bars and indicators.
- Variations: standard

### 39. **radio-group** (~9 patterns)
Radio button groups.
- Variations: standard

### 40. **scroll-area** (~8 patterns)
Custom scrollable areas.
- Variations: standard

### 41. **separator** (~18 patterns)
Visual separators/dividers.
- Variations: standard

### 42. **sheet** (~29 patterns)
Side sheets (similar to drawers).
- Variations: standard

### 43. **skeleton** (~30 patterns)
Loading skeleton screens.
- Variations: standard

### 44. **slider** (~29 patterns)
Range sliders for value selection.
- Variations: standard

### 45. **sonner** (~24 patterns)
Toast notifications (using Sonner).
- Variations: standard

### 46. **spinner** (~17 patterns)
Loading spinners in different styles.
- Variations: button, standard

### 47. **switch** (~19 patterns)
Toggle switches.
- Variations: standard

### 48. **table** (~8 patterns)
Basic data tables.
- Variations: standard

### 49. **tabs** (~11 patterns)
Tabbed content navigation.
- Variations: standard

### 50. **textarea** (~13 patterns)
Multi-line text inputs.
- Variations: standard

### 51. **toggle** (~7 patterns)
Toggle buttons.
- Variations: standard

### 52. **toggle-group** (~7 patterns)
Groups of toggle buttons.
- Variations: standard

### 53. **tooltip** (~8 patterns)
Simple tooltips on hover.
- Variations: standard

---

## Quick Reference by Use Case

### Forms & Input
- `field`, `form`, `input`, `input-group`, `textarea`, `checkbox`, `radio-group`, `switch`

### Navigation
- `navigation-menu`, `menubar`, `breadcrumb`, `tabs`, `pagination`

### Feedback
- `alert`, `sonner`, `progress`, `spinner`, `skeleton`, `empty`

### Overlays
- `dialog`, `alert-dialog`, `drawer`, `sheet`, `popover`, `hover-card`, `tooltip`

### Data Display
- `table`, `data-table`, `card`, `badge`, `avatar`, `separator`

### Charts
- `chart` (area, bar, line, pie, radar, radial)

### Interactive
- `button`, `button-group`, `dropdown-menu`, `context-menu`, `combobox`, `command`

### Layout
- `collapsible`, `accordion`, `carousel`, `scroll-area`, `aspect-ratio`

### Utilities
- `kbd`, `label`, `item`, `calendar`, `date-picker`, `input-otp`, `slider`, `toggle`, `toggle-group`

---

## Tips

1. **Search first**: Use MCP search to find variations within a category
2. **View source**: Check the actual pattern files in `kibo-registry/registry/new-york/patterns/`
3. **Mix and match**: Combine different patterns to create complex UIs
4. **Customize**: All patterns are just starting points - modify as needed

---

## Example Workflows

### Need a button?
```bash
# Search for button patterns
mcp search "@my-patterns" "button"

# Install specific variant
npx shadcn@latest add @my-patterns/pattern-button-destructive-3
```

### Building a form?
```bash
# Search form patterns
mcp search "@my-patterns" "form"

# Also check field patterns
mcp search "@my-patterns" "field"

# Install what you need
npx shadcn@latest add @my-patterns/pattern-form-validation-1
```

### Creating a dashboard?
```bash
# Get charts
mcp search "@my-patterns" "chart"

# Get cards
mcp search "@my-patterns" "card"

# Get tables
mcp search "@my-patterns" "table"
```

---

**Last Updated**: 2025-10-14
**Total Patterns**: 1,105
**Registry**: `@my-patterns` at `http://localhost:3000`

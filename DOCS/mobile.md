# MOBILE-OPTIMIZATION.md
Refactoring Guide for Convergence App

## Purpose
Instructions for refactoring existing Convergence UI to be mobile-optimized for iPhone-sized screens (375px-430px width).

## Tech Stack Context
- **@fastify/react** (SSR) - Server-side rendering with hydration
- **TailwindCSS** - Mobile-first utility classes
- **Shadcn UI** - Component library (not always mobile-ready by default)
- **Target Device**: iPhone (primary), responsive up to desktop

---

## Core Principles

### 1. Mobile-First Approach
Start with mobile layout, then enhance for larger screens using Tailwind breakpoints:
- Default (no prefix): 320px-639px (mobile)
- sm:: 640px+ (large mobile/tablet)
- md:: 768px+ (tablet)
- lg:: 1024px+ (desktop)

### 2. Viewport Configuration
Ensure index.html or root template has:

<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

### 3. Touch-First Interactions
- Minimum touch target: **44px × 44px** (Apple guideline)
- Disable zoom for app-like experience (viewport meta above)
- Use touch-action utilities where needed

---

## Refactoring Patterns

### Pattern 1: Replace Fixed Widths with Responsive Units

// ❌ DON'T
<div className="w-600 px-40">

// ✅ DO
<div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8">

### Pattern 2: Stack Vertically on Mobile, Horizontal on Desktop

// ❌ DON'T
<div className="flex">

// ✅ DO
<div className="flex flex-col md:flex-row gap-4">

### Pattern 3: Responsive Text Sizing

// ❌ DON'T
<h1 className="text-5xl">

// ✅ DO
<h1 className="text-3xl md:text-4xl lg:text-5xl">

### Pattern 4: Responsive Padding/Spacing

// ❌ DON'T
<section className="py-20 px-8">

// ✅ DO
<section className="py-12 px-4 sm:py-16 sm:px-6 lg:py-20 lg:px-8">

### Pattern 5: Grid Layouts

// ❌ DON'T
<div className="grid grid-cols-3">

// ✅ DO
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

---

## Shadcn Component Mobile Adaptations

### Dialog/Modal Components

// Shadcn Dialog needs mobile-friendly sizing
<Dialog>
  <DialogContent className="w-[95vw] max-w-md sm:w-full">
    {/* content */}
  </DialogContent>
</Dialog>

### Card Components

// Ensure cards don't overflow on small screens
<Card className="w-full max-w-sm mx-auto">

### Form Inputs

// Full-width inputs on mobile, constrained on desktop
<Input className="w-full" type="text" />

### Button Groups

// Stack buttons vertically on mobile
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  <Button className="w-full sm:w-auto">Primary</Button>
  <Button className="w-full sm:w-auto" variant="outline">Secondary</Button>
</div>

---

## @fastify/react SSR Considerations

### 1. Avoid Layout Shift on Hydration

// Always set container heights to prevent CLS (Cumulative Layout Shift)
<div className="min-h-screen">
  {/* content */}
</div>

### 2. Server-Side Mobile Detection (Optional)

// In routes, detect mobile from user-agent if needed
// But prefer CSS-based responsive design over server-side detection

---

## Convergence-Specific Refactoring

### Goal Input Form (Home.tsx or similar)

// Mobile keyboard-optimized
<form className="w-full max-w-2xl mx-auto px-4 space-y-6">
  <Input 
    type="text" 
    placeholder="Enter your goal"
    className="w-full text-base" // text-base for mobile keyboards
    autoComplete="off"
  />
  
  <Button 
    type="submit" 
    className="w-full h-12 text-base font-semibold"
  >
    Generate Blueprint
  </Button>
</form>

### Blueprint Display Cards

// Text-heavy content with readable line length on mobile
<Card className="w-full">
  <CardHeader className="space-y-2">
    <CardTitle className="text-xl sm:text-2xl">Blueprint Title</CardTitle>
  </CardHeader>
  <CardContent className="prose prose-sm sm:prose">
    {/* Prose class handles readable line-length automatically */}
  </CardContent>
</Card>

### History List

// Tap-friendly list items
<div className="space-y-3">
  {blueprints.map(bp => (
    <Card 
      key={bp.id}
      className="cursor-pointer active:scale-98 transition-transform"
      onClick={() => navigate(`/blueprint/${bp.id}`)}
    >
      <CardContent className="p-4 min-h-[60px] flex items-center">
        {/* Min height ensures 44px+ touch target */}
      </CardContent>
    </Card>
  ))}
</div>

### Navigation Component

// Mobile: bottom fixed nav or hamburger menu
// Desktop: horizontal nav
<nav className="fixed bottom-0 left-0 right-0 bg-background border-t lg:relative lg:border-t-0">
  <div className="flex justify-around lg:justify-start lg:gap-6 p-2 lg:p-4">
    {/* nav items */}
  </div>
</nav>

---

## Refactoring Checklist

When refactoring existing components:

- [ ] Replace all px values in width/height with responsive Tailwind classes
- [ ] Convert grid-cols-N to responsive variants (e.g., grid-cols-1 md:grid-cols-2)
- [ ] Change flex layouts to flex-col md:flex-row where appropriate
- [ ] Update text sizes: text-3xl → text-2xl md:text-3xl lg:text-4xl
- [ ] Adjust padding: p-8 → p-4 sm:p-6 lg:p-8
- [ ] Check touch targets: buttons/links minimum h-11 (44px)
- [ ] Test Shadcn Dialog/Sheet components on mobile (add max-width classes)
- [ ] Verify forms: full-width inputs, stacked buttons on mobile
- [ ] Check navigation: works on small screens (hamburger or bottom nav)
- [ ] Remove any overflow-hidden that might hide content on mobile
- [ ] Test scrolling: ensure no horizontal scroll on 375px width

---

## Testing Protocol

### Browser DevTools

# Chrome DevTools Device Mode
1. Open DevTools (Cmd+Opt+I / Ctrl+Shift+I)
2. Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
3. Test these sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPhone 14 Pro Max (430px)
4. Check both portrait and landscape

### Real Device Testing
- Test on actual iPhone (Safari)
- Test on Android Chrome (if expanding beyond iPhone)
- Check touch interactions (tap, scroll, form inputs)

---

## Anti-Patterns to Avoid

### ❌ DON'T use pixel values for layout

<div style={{width: '600px'}}> // breaks on mobile

### ❌ DON'T use viewport units without constraints

<div className="w-screen"> // causes horizontal scroll

### ❌ DON'T forget touch target sizing

<button className="h-8"> // too small for fingers (32px)

### ❌ DON'T use hover: without active: on mobile

// Mobile needs active state, not hover
<Button className="hover:bg-gray-100"> // ❌
<Button className="hover:bg-gray-100 active:bg-gray-200"> // ✅

### ❌ DON'T nest responsive modifiers incorrectly

// Tailwind processes left-to-right, mobile-first
<div className="md:text-xl text-sm"> // ❌ wrong order
<div className="text-sm md:text-xl"> // ✅ correct

---

## Quick Reference: Common Conversions

| Desktop Pattern | Mobile-First Refactor |
|----------------|----------------------|
| w-1/2 | w-full md:w-1/2 |
| flex gap-8 | flex flex-col md:flex-row gap-4 md:gap-8 |
| text-4xl | text-2xl md:text-3xl lg:text-4xl |
| p-8 | p-4 sm:p-6 lg:p-8 |
| grid-cols-3 | grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 |
| Fixed sidebar | hidden lg:block + mobile menu |

---

## Performance Notes

- Bundle size: Keep mobile payload lean (code-split routes if app grows)
- Images: Use responsive images (srcset) or Supabase image transformations
- Fonts: Preload critical fonts to avoid FOIT/FOUT on mobile connections
- API calls: Implement request debouncing (500ms) on mobile to prevent excessive calls

---

## When in Doubt

**Default assumption**: Design for 375px width first (iPhone SE), then progressively enhance.

If a pattern isn't documented here:
1. Check Tailwind docs for mobile-first examples
2. Test on DevTools iPhone SE viewport
3. Ensure 44px minimum touch targets
4. Prefer rem/Tailwind spacing over px

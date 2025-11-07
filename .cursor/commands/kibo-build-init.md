You are setting up the page builder workflow system infrastructure.

**This command is run ONCE per project to create the necessary files and folders.**

If the system is already initialized, this command will detect it and exit gracefully.

## Important: Port Configuration

- **Registry server**: Must run on `localhost:3000` (in `kibo-registry/`)
- **Next.js app**: Must run on `localhost:3001` (NOT 3000)
  - Start with: `PORT=3001 npm run dev` or `PORT=3001 pnpm dev`

## Task: Check and Initialize

First, check if the system is already initialized by looking for `/design-docs/` directory.

### If ALREADY initialized:

Output:
```
✓ Page builder system is already initialized.
  Use /build-page to start building pages.
```

Then exit.

### If NOT initialized yet:

Create this structure in the Next.js app:

```
/design-docs
  /pages               # Page specifications (created as needed during build)
  /shared-components
    shared-components.md
```

#### File: `/design-docs/shared-components/shared-components.md`
```markdown
# Shared Components

Components that appear across multiple pages in this project.

## Navigation
- Component: [To be selected during build]
- Used on: All pages

## Other Shared Components
[Added during build process]
```

### After initialization complete:

Output:
```
✓ Page builder system initialized successfully!

Created:
  - /design-docs/pages/ (for page specifications)
  - /design-docs/shared-components/ (for shared component tracking)

Next step: Run /build-page with your project description
Example: /build-page I want to build an admin dashboard with 3 pages

Workflow:
1. AI will analyze your project and create design docs
2. AI will determine Level 1 categories and Level 2 variations needed
3. You browse https://www.kibo-ui.com/patterns to choose Level 3 pattern numbers
4. You tell AI which patterns you want (e.g., "use pattern-button-standard-3")
5. AI installs those patterns and builds your pages
```

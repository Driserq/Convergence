# CSS Rendering Blocker – Diagnostic Notes

## Current Symptoms (Confirmed)
- Fastify dev responses (`curl http://localhost:3001` while `npm run dev` is active) always return the Vite dev template: inline `[object Object]` head placeholder, `@vite/client` script, and no CSS `<link>` tags.
- Browser renders the SSR markup (full Tailwind utility classes, SVGs, buttons) but everything is unstyled because hydration never runs, so the CSS chunk is never requested.
- Browser console (clean + extension-enabled) only shows React DevTools notice plus extension noise (`inject.js` RPC failures); no native Vite/React errors are logged.
- A 404 for `/favicon.ico` appears but is unrelated.

## Attempts So Far (Still Not Resolved)
1. **Tailwind integration fixes** – Added pages directory to `tailwind.config.js`, installed `@tailwindcss/vite`, removed PostCSS overrides. ✅ Builds emit `root-*.css`; ♻️ dev hydration still fails.
2. **HTML template alignment** – `index.html` now includes `<!-- head -->`, `<!-- element -->`, `<!-- hydration -->`, and `$app/mount.js`. ✅ SSR snapshot renders; ♻️ dev still lacks CSS.
3. **Global CSS import** – `pages/root.tsx` imports `../src/styles/globals.css`. ✅ Included in bundle; ♻️ still unstyled in dev.
4. **Supabase/env updates** – `supabase.ts` now uses `import.meta.env`; unrelated to styling.
5. **Build validation** – `npm run build` now succeeds (after widening `tsconfig.server.json` includes). ✅ Both client + server artifacts emit CSS/JS; ♻️ dev server remains unstyled.
6. **Prod boot attempt** – `npm start` previously failed (missing `dist/lib/validation`) but now runs; however, testing still hit the dev instance (3001) which serves the Vite dev template, so CSS symptoms persist.
7. **Hydration polyfill** – Inline `crypto.randomUUID` shim added; browser logs confirm no more native `crypto` errors, but hydration still not triggered.

## Retired Hypotheses
| Hypothesis | Result |
| --- | --- |
| Tailwind purge/content missed landing markup | ❌ CSS bundle contains all utilities; issue is that CSS never loads in browser. |
| Global stylesheet not imported in SSR root | ❌ `pages/root.tsx` imports globals; bundle shows `root-*.css`. |
| Missing `dist/lib/validation` prevented prod server from running | ✅ Fixed via `tsconfig.server.json`; no longer blocks builds but symptom persists because tests are still hitting dev responses. |
| `crypto.randomUUID` missing prevents hydration | ❌ Shim inlined; console no longer reports crypto errors, yet hydration still fails. |

## Outstanding Unknowns
- Are we actually exercising the production server output? When `npm run dev` is active it monopolizes port `3001` and FastifyVite serves the dev template; to verify the built HTML we need to stop the dev watcher entirely, run `npm start`, and `curl http://localhost:3001` again to see the built `<link rel="stylesheet">` tags.
- What does the browser **Network** tab show when loading via `npm run dev`? Specifically, do requests for `/@id/__x00__/index.html?html-proxy&index=0.js` or `/src/styles/globals.css` fail?
- Is `$app/mount.js` executing in dev? Logging inside that file (or checking for `window.__FASTIFY_VITE__`) would confirm whether hydration even begins.
- Why is `<head>` still rendering `[object Object]` despite calling `useHead`? This suggests we never wrapped the app with `createHead()`/`HeadProvider`, so Unhead still serializes objects directly.

## Next Diagnostic Steps / Instructions
1. **Verify pure production render** – Stop the dev watcher entirely, run `npm start`, and hit `curl http://localhost:3001`. We must see the built template (`<link rel="stylesheet" href="/assets/root-*.css" rel="modulepreload">`). If `curl` still shows `@vite/client`, then the prod server never actually started or the dev watcher is still proxying traffic.
2. **Capture dev Network tab** – While `npm run dev` is live, open DevTools → Network filtered by `css` and `js` to confirm whether `/@id/__x00__/index.html?html-proxy&index=0.js` or CSS chunks fail to load. A screenshot of status codes is critical.
3. **Instrument `$app/mount.js`** – Add a temporary `console.log('[FastifyReact] hydrating root')` to confirm whether FastifyReact's client entry runs in dev. If this log never appears, hydration is failing before React even initializes.
4. **Wire Head provider** – Add `import { createHead } from '@unhead/vue'` equivalent for React (`@unhead/react`). Wrap the root with the provider so `[object Object]` stops rendering; this also validates that our client boot executes, because proper head serialization only happens when the provider runs both on server and client.
5. **New hypotheses to test next**:
   - **Dev-only hydrate failure**: FastifyVite dev template might not load CSS because `$app/mount.js` isn’t compiling (e.g., TypeScript error) or `pages` router mismatch prevents `hydrateRoot`. Need runtime logs to confirm.
   - **Production parity gap**: Even if prod serves CSS, the dev server will remain unstyled unless we either proxy the built assets or fix the hydrate script. Once prod is confirmed styled, we can focus on dev-only fixes.

Always ask the user for missing data before assuming. Key artifacts for this issue:
- **Current HTML snapshot** (`curl`)
- **Browser console errors + stack traces**
- **Network tab (CSS/JS requests)**
- **Extension list / clean profile confirmation**

With those pieces we can determine whether the problem is still template-related, hydration-related, or caused by an external script.

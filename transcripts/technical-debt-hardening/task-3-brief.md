### Task 3: Split frontend route and framework bundles

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/vite.config.ts`

**Interfaces:**
- Consumes: existing route modules `AllBookmarksPage`, `BookmarksPage`, `CallbackPage`, and `CollectionsPage`.
- Produces: the same route URLs with lazy page modules and an existing `LoadingState` suspense fallback.

- [ ] **Step 1: Capture the chunk-warning failure**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend build
```

Expected: the build exits 0 but prints `Some chunks are larger than 500 kB after minification`; treat that warning as the failing performance condition.

- [ ] **Step 2: Lazy-load route modules and add a stable fallback**

Replace static route-page imports with `lazy` imports and wrap only the route tree with `Suspense`:

```ts
const CollectionsPage = lazy(() => import('./routes/CollectionsPage'))

<Suspense fallback={<LoadingState label="Loading page…" minHeight="100vh" />}>
  <Routes>{/* existing route definitions */}</Routes>
</Suspense>
```

Keep `AuthGate`, `BrowserRouter`, paths, redirect behavior, and callback path unchanged.

- [ ] **Step 3: Configure deterministic Vite manual chunks**

Add `build.rollupOptions.output.manualChunks` in `frontend/vite.config.ts` using a function that returns these names only for matching `node_modules` paths:

```ts
if (id.includes('/node_modules/@mui/icons-material/')) return 'mui-icons'
if (id.includes('/node_modules/@mui/') || id.includes('/node_modules/@emotion/')) return 'mui-core'
if (id.includes('/node_modules/@auth0/')) return 'auth0'
if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react-router/')) return 'react-router'
```

Return `undefined` for all other module IDs. Do not change `chunkSizeWarningLimit`.

- [ ] **Step 4: Verify route behavior and bundle output**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/App.test.tsx
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend build
```

Expected: existing App tests pass and build exits 0 without `Some chunks are larger than 500 kB after minification`.

- [ ] **Step 5: Commit the bundle split**

```bash
git add frontend/src/App.tsx frontend/vite.config.ts
git commit -m "⚡️ perf: split frontend route bundles"
```


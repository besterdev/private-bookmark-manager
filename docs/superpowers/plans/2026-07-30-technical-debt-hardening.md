# Technical Debt Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove frontend error-detail leakage, React Hook dependency warnings, and the Vite production chunk-size warning without changing product behavior.

**Architecture:** Components retain their existing API-client calls and local state, but discard caught exception details before passing copy to `ErrorState`. Effects use stable callbacks or a primitive collection ID to describe their real dependencies. `App` loads route modules lazily, while Vite separates framework dependencies into deterministic shared chunks.

**Tech Stack:** React 19, React Router 8, TypeScript 6, MUI 9, Vite 8, Vitest, Bun

## Global Constraints

- Use Bun and Node.js `>=22.12.0 <23` for all verification.
- Do not change backend APIs, Auth0 settings, `ApiError`, route URLs, or private-data behavior.
- Never render caught error details, access tokens, headers, Axios configuration, or backend implementation details.
- Do not add a data-fetching library, retry system, error boundary, logging service, or lint-suppression comment.
- Do not increase Vite's chunk warning threshold to hide the warning.
- Keep the visual design and user workflows unchanged except for fixed safe error copy.

---

### Task 1: Render only safe frontend error copy

**Files:**
- Modify: `frontend/src/routes/BookmarksPage.tsx`
- Modify: `frontend/src/routes/BookmarksPage.test.tsx`
- Modify: `frontend/src/routes/CollectionsPage.tsx`
- Modify: `frontend/src/routes/CollectionsPage.test.tsx`
- Modify: `frontend/src/features/collections/CollectionDetail.tsx`
- Modify: `frontend/src/features/collections/CollectionDetail.test.tsx`
- Modify: `frontend/src/auth/AuthGate.tsx`
- Modify: `frontend/src/auth/AuthGate.test.tsx`

**Interfaces:**
- Consumes: existing `ErrorState` props `message: string` and optional `onRetry`.
- Produces: the same loading, retry, create, delete, and protected-content behavior with fixed UI messages.
- Preserves: API client errors may carry transport details internally, but UI components do not render them.

- [ ] **Step 1: Write failing safe-error tests**

Add or revise tests using these sensitive strings:

```ts
const sensitive = 'Internal SQL error: ownerId=auth0|victim password=super-secret'
```

Assert these fixed messages are visible and `sensitive` is absent:

```ts
// BookmarksPage failed load
expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load bookmarks')
expect(screen.queryByText(sensitive)).not.toBeInTheDocument()

// CollectionsPage failed load
expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load collections')
expect(screen.queryByText(sensitive)).not.toBeInTheDocument()

// CollectionDetail failed bookmark load
expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load collection bookmarks')
expect(screen.queryByText(sensitive)).not.toBeInTheDocument()

// AuthGate failed /me verification
expect(await screen.findByRole('alert')).toHaveTextContent('Unable to verify API access')
expect(screen.queryByText(sensitive)).not.toBeInTheDocument()
```

Keep the existing assertions that retry invokes the API again and failed create keeps its dialog open.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/routes/BookmarksPage.test.tsx src/routes/CollectionsPage.test.tsx src/features/collections/CollectionDetail.test.tsx src/auth/AuthGate.test.tsx
```

Expected: FAIL because the current load and verification paths render `cause.message`.

- [ ] **Step 3: Replace caught details with fixed messages**

Use parameterless catches in every affected UI path:

```ts
catch {
  setError({ message: 'Unable to load bookmarks', retry: true })
}
```

Apply the exact fixed strings from Step 1. In `AuthGate`, replace the interpolated `API access verification failed: ${apiError}` output with `ErrorState message={apiError}`.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the Step 2 command.

Expected: all focused tests pass, including existing retry and dialog behavior.

- [ ] **Step 5: Commit the safe-error hardening**

```bash
git add frontend/src/routes/BookmarksPage.tsx frontend/src/routes/BookmarksPage.test.tsx frontend/src/routes/CollectionsPage.tsx frontend/src/routes/CollectionsPage.test.tsx frontend/src/features/collections/CollectionDetail.tsx frontend/src/features/collections/CollectionDetail.test.tsx frontend/src/auth/AuthGate.tsx frontend/src/auth/AuthGate.test.tsx
git commit -m "🔒 fix: render safe frontend error messages"
```

### Task 2: Make hook dependencies match effect behavior

**Files:**
- Modify: `frontend/src/routes/BookmarksPage.tsx`
- Modify: `frontend/src/routes/CollectionsPage.tsx`
- Modify: `frontend/src/features/collections/CollectionDetail.tsx`
- Test: `frontend/src/routes/BookmarksPage.test.tsx`
- Test: `frontend/src/routes/CollectionsPage.test.tsx`
- Test: `frontend/src/features/collections/CollectionDetail.test.tsx`

**Interfaces:**
- Consumes: the existing `api`, filter/search state, `getBookmarks`, and `collection` props.
- Produces: unchanged requests and retries with no `react-hooks/exhaustive-deps` warnings.

- [ ] **Step 1: Capture the existing lint failure**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend lint
```

Expected: three `react-hooks/exhaustive-deps` warnings for `BookmarksPage`, `CollectionsPage`, and `CollectionDetail`.

- [ ] **Step 2: Write behavior-preserving tests before refactoring effects**

Add one rerender-based test per affected component:

```ts
// BookmarksPage: a submitted query triggers a request with q=react.
// CollectionsPage: retry triggers a second /collections request.
// CollectionDetail: changing collection id requests the new collection's bookmarks.
```

Each test must assert the real API path, for example:

```ts
expect(api.get).toHaveBeenCalledWith('/collections/collection-2/bookmarks')
```

- [ ] **Step 3: Run the affected tests and verify they pass before refactor**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/routes/BookmarksPage.test.tsx src/routes/CollectionsPage.test.tsx src/features/collections/CollectionDetail.test.tsx
```

Expected: PASS, proving the behavior to preserve.

- [ ] **Step 4: Stabilize callbacks and primitive dependencies**

In `BookmarksPage` and `CollectionsPage`, wrap `load` in `useCallback` and declare every value used by each request in its dependency array. Invoke it from an effect that depends on `load`:

```ts
const load = useCallback(async () => {
  // existing request and state transitions
}, [api, filter, submittedSearch])

useEffect(() => {
  void load()
}, [load])
```

In `CollectionDetail`, derive the primitive ID and use it throughout the effect:

```ts
const collectionId = collection?.id

useEffect(() => {
  if (!collectionId) return
  // existing request lifecycle using collectionId
}, [collectionId, getBookmarks, retry])
```

Do not use lint suppression comments or depend on the whole `collection` object.

- [ ] **Step 5: Verify behavior and clean lint**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/routes/BookmarksPage.test.tsx src/routes/CollectionsPage.test.tsx src/features/collections/CollectionDetail.test.tsx
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend lint
```

Expected: tests pass and lint exits with no warnings.

- [ ] **Step 6: Commit the hook corrections**

```bash
git add frontend/src/routes/BookmarksPage.tsx frontend/src/routes/BookmarksPage.test.tsx frontend/src/routes/CollectionsPage.tsx frontend/src/routes/CollectionsPage.test.tsx frontend/src/features/collections/CollectionDetail.tsx frontend/src/features/collections/CollectionDetail.test.tsx
git commit -m "🐛 fix: align frontend effect dependencies"
```

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

### Task 4: Senior review and final verification

**Files:**
- Review: all Task 1-3 files and their tests.

**Interfaces:**
- Consumes: the approved design and all Task 1-3 commits.
- Produces: a prioritized review report; only actionable findings receive a focused test-first fix.

- [ ] **Step 1: Conduct senior review**

Check for raw caught error rendering, broken retry/create/delete states, stale closure or repeated-request behavior, lint suppressions, changed route URLs, fallback accessibility, static page imports, warning-threshold changes, and unsafe/non-deterministic manual chunk matching.

- [ ] **Step 2: Fix only actionable findings test-first**

For each finding, add a test that demonstrates the issue, run it to confirm failure, make the smallest fix, rerun the focused test, and commit with the matching Gitmoji.

- [ ] **Step 3: Run final project checks**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run lint
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run typecheck
AUTH0_ISSUER_URL=https://example.auth0.com/ AUTH0_AUDIENCE=https://api.example.test PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run test
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run build
git diff --check
```

Expected: all checks pass on Node.js 22.19.0, frontend lint prints no warnings, and Vite prints no chunk-size warning. Report any unrun check or pre-existing issue exactly.

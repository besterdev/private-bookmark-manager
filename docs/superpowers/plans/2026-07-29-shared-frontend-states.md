# Shared Frontend States and Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reuse accessible loading, error, and empty states across protected frontend flows and cover their state and form/API behavior with tests.

**Architecture:** Add three presentational components below `frontend/src/components/states/`. Routes and features keep their current API calls and local state, passing copy and callbacks into those components. Tests stay close to their component or route and mock only Auth0/API boundaries.

**Tech Stack:** React 19, TypeScript, Material UI, Vitest, React Testing Library, Auth0 React SDK.

## Global Constraints

- Do not change API routes, Auth0 behavior, database schema, or existing success flows.
- Preserve the light design system and current page copy unless a shared state needs accessible status text.
- `ErrorState` only renders Retry when an `onRetry` callback is supplied.
- Empty Bookmarks remains a filter-result message from `BookmarkCardGrid`; only Collections gets an onboarding action.

---

## File Structure

- Create `frontend/src/components/states/LoadingState.tsx` and `.test.tsx`: accessible centered progress state.
- Create `frontend/src/components/states/ErrorState.tsx` and `.test.tsx`: alert and optional Retry action.
- Create `frontend/src/components/states/EmptyState.tsx` and `.test.tsx`: outlined empty state and optional primary action.
- Modify `frontend/src/auth/AuthGate.tsx` and `.test.tsx`: consume shared loading/error states and retry API verification.
- Modify `frontend/src/routes/CollectionsPage.tsx` and create `.test.tsx`: consume shared states and cover empty/error/retry/create failure.
- Modify `frontend/src/routes/BookmarksPage.tsx` and `.test.tsx`: consume shared loading/error states and cover fetch/create failure.
- Modify `frontend/src/features/collections/CollectionDetail.tsx` and `.test.tsx`: consume shared loading/error states.
- Modify `TASKS.md`: mark shared frontend states and frontend form/API tests complete.

### Task 1: Build and test presentational shared states

**Files:**
- Create: `frontend/src/components/states/LoadingState.tsx`
- Create: `frontend/src/components/states/LoadingState.test.tsx`
- Create: `frontend/src/components/states/ErrorState.tsx`
- Create: `frontend/src/components/states/ErrorState.test.tsx`
- Create: `frontend/src/components/states/EmptyState.tsx`
- Create: `frontend/src/components/states/EmptyState.test.tsx`

**Interfaces:**
- `LoadingState({ label, minHeight? }: { label: string; minHeight?: number | string })`
- `ErrorState({ message, onRetry? }: { message: string; onRetry?: () => void })`
- `EmptyState({ title, description, actionLabel?, onAction? }: { title: string; description: string; actionLabel?: string; onAction?: () => void })`

- [ ] **Step 1: Write failing component tests**

```tsx
expect(screen.getByRole('status', { name: 'Loading collections' })).toBeVisible()
expect(screen.getByRole('alert')).toHaveTextContent('Unable to load')
fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
expect(onRetry).toHaveBeenCalledOnce()
expect(screen.getByRole('heading', { name: 'No collections yet' })).toBeVisible()
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `bun --cwd frontend test -- LoadingState.test.tsx ErrorState.test.tsx EmptyState.test.tsx`

Expected: FAIL because the state components do not exist.

- [ ] **Step 3: Implement minimal MUI components**

```tsx
export function LoadingState({ label, minHeight = 240 }: Props) {
  return <Box aria-label={label} role="status" sx={{ display: 'grid', minHeight, placeItems: 'center' }}><Stack alignItems="center" spacing={2}><CircularProgress /><Typography>{label}</Typography></Stack></Box>
}
```

`ErrorState` renders `Alert severity="error"` and a Retry button only when `onRetry` exists. `EmptyState` renders an outlined `Box`, `h6` title, description, and optional contained action.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `bun --cwd frontend test -- LoadingState.test.tsx ErrorState.test.tsx EmptyState.test.tsx && bun --cwd frontend typecheck`

Expected: PASS.

- [ ] **Step 5: Commit shared states**

```bash
git add frontend/src/components/states
git commit -m "✨ feat: add shared frontend states"
```

### Task 2: Integrate AuthGate and collection detail states

**Files:**
- Modify: `frontend/src/auth/AuthGate.tsx`
- Modify: `frontend/src/auth/AuthGate.test.tsx`
- Modify: `frontend/src/features/collections/CollectionDetail.tsx`
- Modify: `frontend/src/features/collections/CollectionDetail.test.tsx`

**Interfaces:**
- Consumes `LoadingState` and `ErrorState` from Task 1.
- `AuthGate` retries `/me` validation using a retry counter.

- [ ] **Step 1: Add failing behavior tests**

```tsx
expect(screen.getByRole('status', { name: 'Signing you in…' })).toBeVisible()
expect(await screen.findByRole('alert')).toHaveTextContent('API access verification failed')
fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
expect(apiGet).toHaveBeenCalledTimes(2)
```

- [ ] **Step 2: Replace local state markup with shared components**

Use `LoadingState` in AuthGate's two loading paths and collection detail's bookmark loading path. Use `ErrorState` for AuthGate API errors and collection detail errors, passing their existing retry callbacks.

- [ ] **Step 3: Run focused tests and typecheck**

Run: `bun --cwd frontend test -- AuthGate.test.tsx CollectionDetail.test.tsx && bun --cwd frontend typecheck`

Expected: PASS.

- [ ] **Step 4: Commit integration**

```bash
git add frontend/src/auth/AuthGate.tsx frontend/src/auth/AuthGate.test.tsx frontend/src/features/collections/CollectionDetail.tsx frontend/src/features/collections/CollectionDetail.test.tsx
git commit -m "♻️ refactor: reuse states in auth and collection detail"
```

### Task 3: Integrate page states and test form/API failures

**Files:**
- Modify: `frontend/src/routes/CollectionsPage.tsx`
- Create: `frontend/src/routes/CollectionsPage.test.tsx`
- Modify: `frontend/src/routes/BookmarksPage.tsx`
- Modify: `frontend/src/routes/BookmarksPage.test.tsx`

**Interfaces:**
- Consumes all shared state components from Task 1.
- Existing API clients retain `get`, `post`, and `delete` signatures.

- [ ] **Step 1: Write failing page tests**

```tsx
api.get.mockRejectedValueOnce(new Error('Network unavailable'))
render(<CollectionsPage />)
expect(await screen.findByRole('alert')).toHaveTextContent('Network unavailable')
fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
expect(api.get).toHaveBeenCalledTimes(2)

fireEvent.click(await screen.findByRole('button', { name: 'Create bookmark' }))
api.post.mockRejectedValueOnce(new Error('Unable to save'))
// fill valid title and URL, submit
expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save')
expect(screen.getByRole('dialog')).toBeVisible()
```

- [ ] **Step 2: Replace repeated page markup and preserve flows**

Use `LoadingState` and `ErrorState` in both pages. Use `EmptyState` only in CollectionsPage, with `Create collection` action. Pass `onRetry={() => void load()}` to recover fetch errors. Do not show retry for create/delete errors.

- [ ] **Step 3: Add form/API state tests**

Test CollectionsPage empty action opens its dialog, fetch error Retry reissues the request, and rejected collection create leaves the dialog open with an alert. Test BookmarksPage fetch error Retry and rejected bookmark create similarly. Keep existing dialog validation tests as the client-validation coverage.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `bun --cwd frontend test -- CollectionsPage.test.tsx BookmarksPage.test.tsx CollectionDialog.test.tsx BookmarkDialog.test.tsx && bun --cwd frontend typecheck`

Expected: PASS.

- [ ] **Step 5: Commit pages and tests**

```bash
git add frontend/src/routes/CollectionsPage.tsx frontend/src/routes/CollectionsPage.test.tsx frontend/src/routes/BookmarksPage.tsx frontend/src/routes/BookmarksPage.test.tsx
git commit -m "✅ test: cover frontend API states"
```

### Task 4: Verify and close the checklist

**Files:**
- Modify: `TASKS.md`

- [ ] **Step 1: Run full frontend verification**

Run: `bun --cwd frontend test && bun --cwd frontend typecheck && bun --cwd frontend build`

Expected: PASS.

- [ ] **Step 2: Mark completed checklist items**

```md
- [x] Add shared loading, empty, validation, and error states
- [x] Test frontend forms and API state handling
```

- [ ] **Step 3: Commit verification status**

```bash
git add TASKS.md
git commit -m "📝 docs: mark frontend states complete"
```

## Verification

- [ ] Run shared-state, AuthGate, detail, page, and dialog focused tests.
- [ ] Run `bun --cwd frontend test`.
- [ ] Run `bun --cwd frontend typecheck`.
- [ ] Run `bun --cwd frontend build`.

## Self-review

- Spec coverage: Tasks 1–4 implement the three shared states, all four integration locations, reusable retries, and form/API failure tests.
- Placeholder scan: Test instructions name the required mocked interactions and preserve existing dialog validation tests rather than adding unscoped backend changes.
- Type consistency: Components consume strings and callbacks only; route API state remains owned by the existing routes and features.

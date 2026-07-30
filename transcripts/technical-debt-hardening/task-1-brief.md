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


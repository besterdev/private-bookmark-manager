# Collection Bookmark Card Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show bookmarks belonging to the selected collection in a responsive, clickable card grid.

**Architecture:** `CollectionDetail` will request `GET /collections/:id/bookmarks` whenever its selected collection changes and will own request state. New focused presentational components will render cards and the responsive grid, keeping API state separate from link and layout concerns.

**Tech Stack:** React 19, TypeScript, Material UI, Vitest, React Testing Library, existing authenticated API client.

## Global Constraints

- Do not change the bookmark API contract or database schema.
- Fetch only through `createApiClient` and the Auth0 access-token supplier.
- Use a three-column desktop, two-column tablet, one-column mobile MUI grid.
- Each external bookmark link must use `target="_blank"` and `rel="noreferrer"`.
- Use the current MUI design system colors; do not add a new styling library.

---

## File Structure

- Create `frontend/src/features/collections/BookmarkCard.tsx`: link-card presentation and image placeholder.
- Create `frontend/src/features/collections/BookmarkCardGrid.tsx`: responsive layout and collection-independent states.
- Create `frontend/src/features/collections/BookmarkCard.test.tsx`: link/card behavior coverage.
- Create `frontend/src/features/collections/BookmarkCardGrid.test.tsx`: empty and populated grid coverage.
- Modify `frontend/src/features/collections/CollectionDetail.tsx`: request selected collection bookmarks and select loading/error/empty/card-grid UI.
- Modify `frontend/src/routes/CollectionsPage.tsx`: provide the authenticated bookmark loader.
- Create `frontend/src/features/collections/CollectionDetail.test.tsx`: request-state coverage at the feature boundary.

### Task 1: Build the bookmark card

**Files:**
- Create: `frontend/src/features/collections/BookmarkCard.tsx`
- Create: `frontend/src/features/collections/BookmarkCard.test.tsx`

**Interfaces:**
- Consumes: `Bookmark` from `frontend/src/features/bookmarks/types.ts`.
- Produces: `BookmarkCard({ bookmark }: { bookmark: Bookmark }): JSX.Element`.

- [ ] **Step 1: Write the failing card behavior test**

```tsx
it('opens its bookmark URL in a new tab safely', () => {
  render(<BookmarkCard bookmark={{ id: 'b1', title: 'MUI', url: 'https://mui.com', notes: null, collectionId: 'c1', createdAt: '2026-07-28T00:00:00.000Z', updatedAt: '2026-07-28T00:00:00.000Z' }} />)

  const link = screen.getByRole('link', { name: /mui/i })
  expect(link).toHaveAttribute('href', 'https://mui.com')
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noreferrer')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun --cwd frontend test -- BookmarkCard.test.tsx`

Expected: FAIL because `BookmarkCard` does not exist.

- [ ] **Step 3: Write the minimal card implementation**

```tsx
export default function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const host = new URL(bookmark.url).hostname
  return <Card component="a" href={bookmark.url} rel="noreferrer" target="_blank" sx={{ display: 'block', textDecoration: 'none' }}>
    <Box sx={{ aspectRatio: '16 / 9', bgcolor: 'primary.dark', display: 'grid', placeItems: 'center' }}><BookmarkBorderIcon color="inherit" /></Box>
    <CardContent><Typography color="text.primary" fontWeight={700}>{bookmark.title}</Typography><Typography color="text.secondary" variant="body2">{host}</Typography></CardContent>
  </Card>
}
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `bun --cwd frontend test -- BookmarkCard.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the focused card component**

```bash
git add frontend/src/features/collections/BookmarkCard.tsx frontend/src/features/collections/BookmarkCard.test.tsx
git commit -m "✨ feat: add bookmark card"
```

### Task 2: Build the responsive card grid

**Files:**
- Create: `frontend/src/features/collections/BookmarkCardGrid.tsx`
- Create: `frontend/src/features/collections/BookmarkCardGrid.test.tsx`

**Interfaces:**
- Consumes: `Bookmark[]` and `BookmarkCard` from Task 1.
- Produces: `BookmarkCardGrid({ bookmarks }: { bookmarks: Bookmark[] }): JSX.Element`.

- [ ] **Step 1: Write the failing grid tests**

```tsx
it('shows an empty-state message when the collection has no bookmarks', () => {
  render(<BookmarkCardGrid bookmarks={[]} />)
  expect(screen.getByText('No bookmarks in this collection yet.')).toBeVisible()
})

it('renders every bookmark as a card', () => {
  render(<BookmarkCardGrid bookmarks={[bookmark('b1', 'MUI'), bookmark('b2', 'React')]} />)
  expect(screen.getByRole('link', { name: /mui/i })).toBeVisible()
  expect(screen.getByRole('link', { name: /react/i })).toBeVisible()
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun --cwd frontend test -- BookmarkCardGrid.test.tsx`

Expected: FAIL because `BookmarkCardGrid` does not exist.

- [ ] **Step 3: Write the minimal responsive grid implementation**

```tsx
export default function BookmarkCardGrid({ bookmarks }: { bookmarks: Bookmark[] }) {
  if (bookmarks.length === 0) return <Typography color="text.secondary">No bookmarks in this collection yet.</Typography>
  return <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' } }}>
    {bookmarks.map((bookmark) => <BookmarkCard bookmark={bookmark} key={bookmark.id} />)}
  </Box>
}
```

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `bun --cwd frontend test -- BookmarkCardGrid.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the grid**

```bash
git add frontend/src/features/collections/BookmarkCardGrid.tsx frontend/src/features/collections/BookmarkCardGrid.test.tsx
git commit -m "✨ feat: add bookmark card grid"
```

### Task 3: Connect the selected collection to its bookmarks

**Files:**
- Modify: `frontend/src/features/collections/CollectionDetail.tsx`
- Modify: `frontend/src/routes/CollectionsPage.tsx`
- Create: `frontend/src/features/collections/CollectionDetail.test.tsx`

**Interfaces:**
- Consumes: `collection?: Collection`, `getBookmarks: (collectionId: string) => Promise<Bookmark[]>`, and `BookmarkCardGrid` from Task 2.
- Produces: `CollectionDetail` that renders skeletons while loading, an error Alert with Retry on failure, or the card grid after success.

- [ ] **Step 1: Write the failing loading and error tests**

```tsx
it('shows a loading indicator while selected collection bookmarks are requested', () => {
  render(<CollectionDetail collection={collection} getBookmarks={() => new Promise(() => {})} onDelete={vi.fn()} />)
  expect(screen.getByRole('progressbar')).toBeVisible()
})

it('offers Retry after bookmark loading fails', async () => {
  const getBookmarks = vi.fn().mockRejectedValue(new Error('Network unavailable'))
  render(<CollectionDetail collection={collection} getBookmarks={getBookmarks} onDelete={vi.fn()} />)
  expect(await screen.findByText(/network unavailable/i)).toBeVisible()
  expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun --cwd frontend test -- CollectionDetail.test.tsx`

Expected: FAIL because `getBookmarks` is not a supported prop and request state is absent.

- [ ] **Step 3: Implement request state and API wiring in the parent page**

```tsx
const getBookmarks = useCallback((collectionId: string) => api.get<Bookmark[]>(`/collections/${collectionId}/bookmarks`), [api])

<CollectionDetail collection={selected} getBookmarks={getBookmarks} onDelete={() => setDeleteOpen(true)} />
```

Inside `CollectionDetail`, start the request in `useEffect` when `collection?.id` changes, ignore stale responses in its cleanup callback, render `<CircularProgress />` while pending, show an `<Alert>` containing the request error and a `Retry` button on rejection, and render `<BookmarkCardGrid bookmarks={bookmarks} />` after success.

- [ ] **Step 4: Run the focused feature tests to verify they pass**

Run: `bun --cwd frontend test -- CollectionDetail.test.tsx BookmarkCardGrid.test.tsx BookmarkCard.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the integrated collection view**

```bash
git add frontend/src/routes/CollectionsPage.tsx frontend/src/features/collections/CollectionDetail.tsx frontend/src/features/collections/CollectionDetail.test.tsx
git commit -m "✨ feat: show collection bookmarks"
```

## Verification

- [ ] Run `bun --cwd frontend test -- BookmarkCard.test.tsx BookmarkCardGrid.test.tsx CollectionDetail.test.tsx`.
- [ ] Run `bun --cwd frontend typecheck`.
- [ ] Open Collections, select a collection with bookmarks, and confirm each card opens its URL in a new tab.

## Self-review

- Spec coverage: Tasks 1–3 cover card presentation, responsive grid, selected-collection data flow, loading, empty, error, retry, and tests.
- Placeholder scan: no unresolved implementation markers or deferred steps remain.
- Type consistency: Task 1 exports `BookmarkCard`; Task 2 consumes it and exports `BookmarkCardGrid`; Task 3 consumes the same `Bookmark[]` API response.

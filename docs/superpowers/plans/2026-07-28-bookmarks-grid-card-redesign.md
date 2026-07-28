# Bookmarks Grid Card Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Bookmarks list/detail layout with a responsive light-theme card grid that preserves filtering, creation, and deletion.

**Architecture:** Presentational `BookmarkCard` and `BookmarkCardGrid` components will live in the bookmarks feature. `BookmarksPage` remains the API-state owner and passes items, collection labels, and a delete callback to the grid; the existing confirmation dialog remains the final delete gate.

**Tech Stack:** React 19, TypeScript, Material UI, Vitest, React Testing Library, existing Auth0 API client.

## Global Constraints

- Do not change bookmark API contracts or the database schema.
- Keep the current light design system: Smalt `#003399`, Blaze Orange `#FF6E00`, Mine Shaft `#3F3F3F`.
- Use a three-column desktop, two-column tablet, one-column mobile MUI grid.
- Links open in a new tab with `target="_blank"` and `rel="noreferrer"`.
- Render preview placeholders from the design system because bookmarks have no image URL.
- Preserve the existing collection filter, create dialog, delete confirmation, loading indicator, and error alert.

---

## File Structure

- Create `frontend/src/features/bookmarks/BookmarkCard.tsx`: visual card, external-link area, and delete action trigger.
- Create `frontend/src/features/bookmarks/BookmarkCard.test.tsx`: external-link and delete-action behavior.
- Create `frontend/src/features/bookmarks/BookmarkCardGrid.tsx`: responsive grid and empty state.
- Create `frontend/src/features/bookmarks/BookmarkCardGrid.test.tsx`: grid and empty-state behavior.
- Modify `frontend/src/routes/BookmarksPage.tsx`: replace list/detail selection with grid callbacks and direct delete target state.
- Modify `frontend/src/features/bookmarks/types.ts`: only if a `BookmarkCard` prop type needs an exported shared type; otherwise leave unchanged.

### Task 1: Build the visual bookmark card

**Files:**
- Create: `frontend/src/features/bookmarks/BookmarkCard.tsx`
- Create: `frontend/src/features/bookmarks/BookmarkCard.test.tsx`

**Interfaces:**
- Consumes: `Bookmark` from `frontend/src/features/bookmarks/types.ts`.
- Produces: `BookmarkCard({ bookmark, collectionName, onDelete }: { bookmark: Bookmark; collectionName: string; onDelete: (bookmark: Bookmark) => void }): JSX.Element`.

- [ ] **Step 1: Write failing tests for link and delete behavior**

```tsx
it('opens the bookmark from its card action area in a new tab safely', () => {
  render(<BookmarkCard bookmark={bookmark} collectionName="Design" onDelete={vi.fn()} />)
  const link = screen.getByRole('link', { name: /mui/i })
  expect(link).toHaveAttribute('href', 'https://mui.com')
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noreferrer')
})

it('passes its bookmark to the delete action', () => {
  const onDelete = vi.fn()
  render(<BookmarkCard bookmark={bookmark} collectionName="Design" onDelete={onDelete} />)
  fireEvent.click(screen.getByRole('button', { name: 'Delete bookmark' }))
  expect(onDelete).toHaveBeenCalledWith(bookmark)
})
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `bun --cwd frontend test -- BookmarkCard.test.tsx`

Expected: FAIL because `BookmarkCard` does not exist.

- [ ] **Step 3: Write the minimal accessible card implementation**

```tsx
export default function BookmarkCard({ bookmark, collectionName, onDelete }: Props) {
  return <Card variant="outlined">
    <CardActionArea component="a" href={bookmark.url} rel="noreferrer" target="_blank">
      <Box sx={{ aspectRatio: '16 / 9', bgcolor: 'primary.main', color: 'common.white', display: 'grid', placeItems: 'center' }}><BookmarkBorderIcon fontSize="large" /></Box>
      <CardContent><Typography noWrap sx={{ fontWeight: 700 }}>{bookmark.title}</Typography><Typography color="text.secondary" noWrap variant="body2">{new URL(bookmark.url).hostname}</Typography>{bookmark.notes && <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">{bookmark.notes}</Typography>}</CardContent>
    </CardActionArea>
    <CardActions sx={{ justifyContent: 'space-between' }}><Chip label={collectionName} size="small" /><IconButton aria-label="Delete bookmark" color="error" onClick={() => onDelete(bookmark)}><DeleteOutlineIcon /></IconButton></CardActions>
  </Card>
}
```

- [ ] **Step 4: Run the card test to verify it passes**

Run: `bun --cwd frontend test -- BookmarkCard.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the card**

```bash
git add frontend/src/features/bookmarks/BookmarkCard.tsx frontend/src/features/bookmarks/BookmarkCard.test.tsx
git commit -m "✨ feat: add bookmark grid card"
```

### Task 2: Build the responsive bookmark grid

**Files:**
- Create: `frontend/src/features/bookmarks/BookmarkCardGrid.tsx`
- Create: `frontend/src/features/bookmarks/BookmarkCardGrid.test.tsx`

**Interfaces:**
- Consumes: `Bookmark[]`, `Record<string, string>`, and `BookmarkCard` from Task 1.
- Produces: `BookmarkCardGrid({ items, collectionNameById, onDelete }: { items: Bookmark[]; collectionNameById: Record<string, string>; onDelete: (bookmark: Bookmark) => void }): JSX.Element`.

- [ ] **Step 1: Write failing grid tests**

```tsx
it('shows an empty message for the active filter with no bookmarks', () => {
  render(<BookmarkCardGrid collectionNameById={{}} items={[]} onDelete={vi.fn()} />)
  expect(screen.getByText('No bookmarks found.')).toBeVisible()
})

it('renders one card for each bookmark', () => {
  render(<BookmarkCardGrid collectionNameById={{ c1: 'Design' }} items={[bookmark('b1', 'MUI'), bookmark('b2', 'React')]} onDelete={vi.fn()} />)
  expect(screen.getByRole('link', { name: /mui/i })).toBeVisible()
  expect(screen.getByRole('link', { name: /react/i })).toBeVisible()
})
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `bun --cwd frontend test -- BookmarkCardGrid.test.tsx`

Expected: FAIL because `BookmarkCardGrid` does not exist.

- [ ] **Step 3: Write the responsive grid implementation**

```tsx
export default function BookmarkCardGrid({ items, collectionNameById, onDelete }: Props) {
  if (items.length === 0) return <Typography color="text.secondary">No bookmarks found.</Typography>
  return <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' } }}>
    {items.map((bookmark) => <BookmarkCard bookmark={bookmark} collectionName={bookmark.collectionId ? (collectionNameById[bookmark.collectionId] ?? 'Unsorted') : 'Unsorted'} key={bookmark.id} onDelete={onDelete} />)}
  </Box>
}
```

- [ ] **Step 4: Run the grid test to verify it passes**

Run: `bun --cwd frontend test -- BookmarkCardGrid.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the grid**

```bash
git add frontend/src/features/bookmarks/BookmarkCardGrid.tsx frontend/src/features/bookmarks/BookmarkCardGrid.test.tsx
git commit -m "✨ feat: add bookmarks grid"
```

### Task 3: Wire the Bookmarks page to the grid

**Files:**
- Modify: `frontend/src/routes/BookmarksPage.tsx`

**Interfaces:**
- Consumes: `BookmarkCardGrid` from Task 2 and the existing `BookmarkDialog` props.
- Produces: a Bookmarks page without `BookmarkList`, `BookmarkDetail`, or `selectedId`; it owns `bookmarkToDelete?: Bookmark` for the confirmation dialog.

- [ ] **Step 1: Write a failing page-level delete-target test**

```tsx
it('opens the delete confirmation for the bookmark selected from a card', async () => {
  render(<BookmarksPage />)
  fireEvent.click(await screen.findByRole('button', { name: 'Delete bookmark' }))
  expect(screen.getByRole('heading', { name: 'Delete bookmark?' })).toBeVisible()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun --cwd frontend test -- BookmarksPage.test.tsx`

Expected: FAIL because the page still renders `BookmarkList` and needs a selected detail panel before deletion.

- [ ] **Step 3: Replace selection state with card-grid delete state**

```tsx
const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark>()
const collectionNameById = Object.fromEntries(collections.map((collection) => [collection.id, collection.name]))

const remove = async () => {
  if (!bookmarkToDelete) return
  await api.delete(`/bookmarks/${bookmarkToDelete.id}`)
  setItems((current) => current.filter((item) => item.id !== bookmarkToDelete.id))
  setBookmarkToDelete(undefined)
}

<BookmarkCardGrid collectionNameById={collectionNameById} items={items} onDelete={setBookmarkToDelete} />
```

Remove `BookmarkList`, `BookmarkDetail`, `selectedId`, and the two-column layout. Change the dialog `open` prop to `Boolean(bookmarkToDelete)` and its close handler to `() => setBookmarkToDelete(undefined)`.

- [ ] **Step 4: Run focused UI tests and typecheck**

Run: `bun --cwd frontend test -- BookmarkCard.test.tsx BookmarkCardGrid.test.tsx BookmarksPage.test.tsx && bun --cwd frontend typecheck`

Expected: PASS.

- [ ] **Step 5: Commit the page integration**

```bash
git add frontend/src/routes/BookmarksPage.tsx frontend/src/routes/BookmarksPage.test.tsx
git commit -m "✨ feat: redesign bookmarks as card grid"
```

## Verification

- [ ] Run `bun --cwd frontend test -- BookmarkCard.test.tsx BookmarkCardGrid.test.tsx BookmarksPage.test.tsx`.
- [ ] Run `bun --cwd frontend typecheck`.
- [ ] Verify in the browser that collection filters update the grid, cards open external links, and a card delete action opens the confirmation dialog.

## Self-review

- Spec coverage: Tasks 1–3 implement the responsive grid, light-theme preview placeholders, metadata, link behavior, collection labels, deletion, filter preservation, and tests.
- Placeholder scan: no unresolved implementation markers or deferred steps remain.
- Type consistency: both card and grid consume `Bookmark`; the page passes `Record<string, string>` collection labels and `onDelete(bookmark)` unchanged through the grid.

### Task 3: Shared deletion flow on both bookmark pages

**Files:**
- Create: `frontend/src/features/bookmarks/BookmarkDeleteDialog.tsx`
- Create: `frontend/src/features/bookmarks/BookmarkDeleteDialog.test.tsx`
- Modify: `frontend/src/routes/AllBookmarksPage.tsx`
- Modify: `frontend/src/routes/AllBookmarksPage.test.tsx`
- Modify: `frontend/src/routes/BookmarksPage.tsx`
- Modify: `frontend/src/routes/BookmarksPage.test.tsx`

**Interfaces:**
- Produces: `BookmarkDeleteDialog({ bookmark, onCancel, onConfirm })`.
- Consumes: `api.delete('/bookmarks/:id')` and route-local `Bookmark[]` state.

- [ ] **Step 1: Write failing delete-flow tests**

Test the shared dialog confirmation/cancel callbacks. In `/all`, click `Delete bookmark`, confirm, assert `api.delete('/bookmarks/bookmark-1')`, and verify the card disappears. Add a rejected-delete case that keeps the card and shows a non-retryable safe error.

```tsx
fireEvent.click(screen.getByRole('button', { name: 'Delete bookmark' }))
fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/bookmarks/bookmark-1'))
expect(screen.queryByRole('link', { name: /MUI/i })).not.toBeInTheDocument()
```

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `bun --cwd frontend test -- BookmarkDeleteDialog.test.tsx AllBookmarksPage.test.tsx`

Expected: FAIL because the shared dialog does not exist and `/all` still passes a no-op delete callback.

- [ ] **Step 3: Implement shared confirmation and route-owned deletion**

Create the dialog with this interface:

```ts
interface BookmarkDeleteDialogProps {
  bookmark?: Bookmark
  onCancel: () => void
  onConfirm: () => void
}
```

Move the existing confirmation markup out of `BookmarksPage`. In `AllBookmarksPage`, store `bookmarkToDelete`, call the authenticated DELETE endpoint, remove the item only after success, close the dialog, and use the existing `ErrorState` for a safe failure message. Pass `setBookmarkToDelete` to every card grid; remove all no-op callbacks.

- [ ] **Step 4: Verify both deletion flows**

Run:

```bash
bun --cwd frontend test -- BookmarkDeleteDialog.test.tsx AllBookmarksPage.test.tsx BookmarksPage.test.tsx
bun --cwd frontend typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit bookmark actions**

```bash
git add frontend/src/features/bookmarks/BookmarkDeleteDialog.tsx frontend/src/features/bookmarks/BookmarkDeleteDialog.test.tsx frontend/src/routes/AllBookmarksPage.tsx frontend/src/routes/AllBookmarksPage.test.tsx frontend/src/routes/BookmarksPage.tsx frontend/src/routes/BookmarksPage.test.tsx
git commit -m "🐛 fix: enable deletion from all bookmarks"
```


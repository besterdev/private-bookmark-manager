### Task 1: Theme foundation and shared search presentation

**Files:**
- Create: `frontend/src/theme.ts`
- Create: `frontend/src/features/bookmarks/BookmarkSearchToolbar.tsx`
- Create: `frontend/src/features/bookmarks/BookmarkSearchToolbar.test.tsx`
- Modify: `frontend/index.html`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/routes/AllBookmarksPage.tsx`
- Modify: `frontend/src/routes/BookmarksPage.tsx`
- Modify: `frontend/src/features/bookmarks/BookmarkCard.tsx`
- Test: `frontend/src/features/bookmarks/BookmarkCard.test.tsx`

**Interfaces:**
- Produces: `appTheme: Theme` from `frontend/src/theme.ts`.
- Produces: `BookmarkSearchToolbar({ value, onChange, onSubmit, children? })`.
- Consumes: existing page query state and `BookmarkCard` props without changing API types.

- [ ] **Step 1: Write failing toolbar and card tests**

Add a toolbar test that enters `react`, submits the form, and asserts `onChange('react')` and `onSubmit()` are called. Extend the card test to assert the branded fallback visual has accessible text and that keyboard focus remains on the external link.

```tsx
render(<BookmarkSearchToolbar onChange={onChange} onSubmit={onSubmit} value="" />)
fireEvent.change(screen.getByLabelText('Search bookmarks'), { target: { value: 'react' } })
fireEvent.submit(screen.getByRole('search'))
expect(onChange).toHaveBeenCalledWith('react')
expect(onSubmit).toHaveBeenCalledOnce()
```

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `bun --cwd frontend test -- BookmarkSearchToolbar.test.tsx BookmarkCard.test.tsx`

Expected: FAIL because the toolbar does not exist and the card has no labelled fallback visual.

- [ ] **Step 3: Implement the theme and presentational components**

Create `appTheme` with the approved palette, Public Sans typography, 12px shape radius, restrained shadows, and overrides for `MuiButton`, `MuiCard`, `MuiChip`, `MuiDrawer`, and `MuiTextField`. Load Public Sans with preconnect and stylesheet links in `index.html`; set the title to `Private Bookmark Manager`.

Implement the toolbar as a labelled `role="search"` form:

```ts
interface BookmarkSearchToolbarProps {
  children?: ReactNode
  onChange: (value: string) => void
  onSubmit: () => void
  value: string
}
```

Use the toolbar from both route pages while keeping their submitted-search and collection-filter state local. Refine the card with a labelled fallback region, subtle lift transition, visible focus, consistent padding, and the existing safe external link.

- [ ] **Step 4: Verify focused tests and frontend types**

Run:

```bash
bun --cwd frontend test -- BookmarkSearchToolbar.test.tsx BookmarkCard.test.tsx AllBookmarksPage.test.tsx BookmarksPage.test.tsx
bun --cwd frontend typecheck
```

Expected: all commands exit `0`.

- [ ] **Step 5: Commit the theme slice**

```bash
git add frontend/index.html frontend/src/theme.ts frontend/src/App.tsx frontend/src/features/bookmarks/BookmarkSearchToolbar.tsx frontend/src/features/bookmarks/BookmarkSearchToolbar.test.tsx frontend/src/features/bookmarks/BookmarkCard.tsx frontend/src/features/bookmarks/BookmarkCard.test.tsx frontend/src/routes/AllBookmarksPage.tsx frontend/src/routes/BookmarksPage.tsx
git commit -m "💄 style: apply Minimal-inspired bookmark theme"
```


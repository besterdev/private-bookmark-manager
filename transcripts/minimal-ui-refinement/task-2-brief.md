### Task 2: Responsive application navigation

**Files:**
- Modify: `frontend/src/layout/AppShell.tsx`
- Modify: `frontend/src/App.test.tsx`

**Interfaces:**
- Consumes: existing navigation entries and `NavLink` routes.
- Produces: labelled `Open navigation` and `Close navigation` controls plus one temporary mobile drawer.

- [ ] **Step 1: Write failing mobile navigation tests**

Extend `App.test.tsx` to assert the menu button opens a dialog/drawer containing all three routes, Escape or the close button dismisses it, and selecting `All bookmarks` closes the mobile drawer.

```tsx
fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument()
fireEvent.click(screen.getAllByRole('link', { name: 'All bookmarks' }).at(-1)!)
await waitFor(() => expect(screen.queryByRole('button', { name: 'Close navigation' })).not.toBeInTheDocument())
```

- [ ] **Step 2: Run the app test and confirm RED**

Run: `bun --cwd frontend test -- App.test.tsx`

Expected: FAIL because no mobile menu button or temporary drawer exists.

- [ ] **Step 3: Implement the responsive shell**

Add local `mobileOpen` state. Render a menu icon button with `aria-label="Open navigation"` below `md`, retain the permanent drawer at `md+`, and render a temporary drawer below `md`. Extract one local `NavigationList({ onNavigate })` renderer so both drawers use the same routes. The mobile list calls `setMobileOpen(false)` after navigation, and the drawer supports backdrop/Escape dismissal through MUI `onClose`.

Keep the product title truncatable and the account button accessible at narrow widths.

- [ ] **Step 4: Verify navigation behaviour**

Run:

```bash
bun --cwd frontend test -- App.test.tsx
bun --cwd frontend typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit responsive navigation**

```bash
git add frontend/src/layout/AppShell.tsx frontend/src/App.test.tsx
git commit -m "✨ feat: add responsive app navigation"
```


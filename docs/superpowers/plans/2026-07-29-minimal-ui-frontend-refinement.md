# Minimal-Inspired Frontend Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a coherent Minimal-inspired MUI visual system, restore mobile navigation, make deletion work from `/all`, and add reusable backend, frontend, and review playbooks.

**Architecture:** Move global visual decisions into one MUI theme module and extract presentational bookmark toolbar and confirmation components. Keep API state in route pages, share only visual/interaction primitives, and use one responsive application shell with permanent and temporary drawer variants.

**Tech Stack:** React 19, TypeScript strict mode, MUI 9, React Router 8, Auth0 React SDK, Vitest/Testing Library, Bun.

## Global Constraints

- Use Minimal UI as visual and interaction inspiration only; do not copy source, paid templates, or assets.
- Retain `#003399`, `#FF6E00`, and `#3F3F3F` as authoritative brand colours.
- Load Public Sans from `frontend/index.html`; do not add a font package.
- Preserve documented HTTP contracts, Auth0 flow, database schema, and owner isolation.
- Use MUI components with accessible names, visible focus, and keyboard-operable controls.
- Every displayed action must perform its stated behaviour; no no-op controls.
- Use Bun and Node.js 22.12+ (below 23).

---

## File structure

| File | Responsibility |
| --- | --- |
| `frontend/src/theme.ts` | Exports the shared brand theme and MUI overrides. |
| `frontend/index.html` | Loads Public Sans and provides the product document title. |
| `frontend/src/features/bookmarks/BookmarkSearchToolbar.tsx` | Presentational search form with optional filter content. |
| `frontend/src/features/bookmarks/BookmarkDeleteDialog.tsx` | Shared accessible delete confirmation. |
| `frontend/src/layout/AppShell.tsx` | Desktop and mobile navigation shell. |
| `frontend/src/features/bookmarks/BookmarkCard.tsx` | Minimal-inspired bookmark card presentation. |
| `frontend/src/routes/AllBookmarksPage.tsx` | Search, grouping, and real bookmark deletion on `/all`. |
| `frontend/src/routes/BookmarksPage.tsx` | Uses shared search and confirmation components. |
| `.agent/*.md` | Repository-local backend, frontend, and quality playbooks. |

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

### Task 4: Repository-local reusable agent playbooks

**Files:**
- Create: `.agent/README.md`
- Create: `.agent/backend-api-security.md`
- Create: `.agent/frontend-ui-tests.md`
- Create: `.agent/quality-review.md`
- Modify: `TASKS.md`

**Interfaces:**
- Consumes: `AGENTS.md`, `API_DESIGN.md`, `DECISIONS.md`, `AI_WORKFLOW.md`, and the approved design specs.
- Produces: role-selection guidance and scoped backend, frontend, and quality checklists.

- [ ] **Step 1: Write the four playbooks**

Create concise Markdown files with Purpose, Use when, Read first, Guardrails, Workflow, Commands, and Definition of done sections. The backend playbook must require validated Auth0 `sub`, owner-scoped Prisma access, `404` privacy, DTO validation, API documentation, and two-user tests. The frontend playbook must require approved brand tokens, Public Sans, Minimal-inspired MUI patterns, responsive navigation, real actions, shared states, and Vitest coverage. The review playbook must remain read-only until a finding is approved and check privacy, mobile navigation, fonts, keyboard access, inactive controls, documentation, and exact command outcomes.

- [ ] **Step 2: Verify guidance consistency**

Run:

```bash
rg -n "owner|404|Auth0|responsive|Public Sans|no-op|bun run" .agent
rg -n "PLACEHOLDER|FIXME" .agent
```

Expected: the first command finds the required guidance; the second returns no matches.

- [ ] **Step 3: Mark the reusable-agent task complete**

Change only `Add .agent/ reusable agent capability` from unchecked to checked in `TASKS.md`.

- [ ] **Step 4: Commit the playbooks**

```bash
git add .agent/README.md .agent/backend-api-security.md .agent/frontend-ui-tests.md .agent/quality-review.md TASKS.md
git commit -m "📝 docs: add reusable engineering playbooks"
```

### Task 5: Full verification and visual review

**Files:**
- Review only; no planned source changes.

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: verified frontend and repository status ready for merge review.

- [ ] **Step 1: Run automated verification**

```bash
bun --cwd frontend test
bun run lint
bun run typecheck
bun run build
```

Expected: every command exits `0`; report pre-existing warnings separately.

- [ ] **Step 2: Run focused browser review**

Using the authenticated local app, verify desktop and mobile widths for `/all`, `/collections`, and `/bookmarks`. Confirm navigation, focus order, search/filter submission, external-card links, delete confirmation, loading/empty/error surfaces, and no horizontal overflow.

- [ ] **Step 3: Inspect the final diff**

Run:

```bash
git diff --check main...HEAD
git status --short
git log --oneline main..HEAD
```

Expected: no whitespace errors, no uncommitted changes, and focused Gitmoji commits.

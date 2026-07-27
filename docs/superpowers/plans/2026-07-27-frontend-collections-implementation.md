# Collections Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver an authenticated, responsive Collections workspace with list/detail/create/delete behaviors backed by the private Collections API.

**Architecture:** Extend the token-aware client with generic request helpers. Keep collection data and selected ID inside `CollectionsPage`; focused presentational components render the list, detail, and create/delete dialogs. The page obtains Auth0 tokens at the boundary and never stores them.

**Tech Stack:** React 19, TypeScript, MUI 9, Auth0 React SDK, Vitest.

## Global Constraints

- All API calls use the authenticated API client and never receive an owner ID from the UI.
- Preserve the approved Smalt/Blaze Orange/Mine Shaft design system.
- Provide loading, empty, API-error, and collection-name validation states.

---

### Task 1: Extend the authenticated API client

**Files:**
- Modify: `frontend/src/lib/api-client.ts`
- Modify: `frontend/src/lib/api-client.test.ts`

- [ ] Write failing tests for `post('/collections', { name })` with Bearer authorization and `delete('/collections/:id')` with a 204 response.
- [ ] Implement `post<T>(path, body)` and `delete(path)`. Reuse a single internal request function that preserves `ApiError` behavior and handles empty response bodies.
- [ ] Run `bun run test -- api-client.test.ts` and typecheck.
- [ ] Commit:

```bash
git add frontend/src/lib/api-client.ts frontend/src/lib/api-client.test.ts
git commit -m "✨ feat: extend authenticated API client"
```

### Task 2: Build testable Collections workspace components

**Files:**
- Create: `frontend/src/features/collections/types.ts`
- Create: `frontend/src/features/collections/CollectionList.tsx`
- Create: `frontend/src/features/collections/CollectionDetail.tsx`
- Create: `frontend/src/features/collections/CollectionDialog.tsx`
- Create: `frontend/src/features/collections/CollectionDialog.test.tsx`

- [ ] Write a failing dialog test for empty/whitespace name validation and submit with a trimmed name.
- [ ] Implement the typed collection model, accessible selection list, detail metadata, and reusable create/delete confirmation dialogs.
- [ ] Run the component test.
- [ ] Commit:

```bash
git add frontend/src/features/collections
git commit -m "✨ feat: add collection workspace components"
```

### Task 3: Connect CollectionsPage to Auth0 and API state

**Files:**
- Modify: `frontend/src/routes/CollectionsPage.tsx`
- Modify: `frontend/src/App.test.tsx`
- Modify: `TASKS.md`

- [ ] Write a failing page test for the empty state with a Create collection action.
- [ ] Implement initial GET, retryable API error, create/update selected state, delete/update selected state, and mobile back behavior.
- [ ] Update the route test as needed and mark collections list/detail/create/delete tasks as complete; keep selected-collection bookmarks pending.
- [ ] Run frontend test, typecheck, and production build.
- [ ] Commit:

```bash
git add frontend/src/routes/CollectionsPage.tsx frontend/src/App.test.tsx TASKS.md
git commit -m "✨ feat: connect collections workspace to API"
```

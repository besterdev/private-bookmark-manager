# All Bookmarks and Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add owner-scoped full-text bookmark search and expose it from the grouped `/all` view and existing `/bookmarks` view.

**Architecture:** Extend the existing bookmark-list DTO and Prisma `findMany` predicate with an optional `q` parameter. Keep `/all` as a frontend composition of the existing collection and bookmark list APIs, grouping the returned bookmark array by `collectionId`; reuse existing card-grid and shared state components.

**Tech Stack:** NestJS, Prisma/MySQL, class-validator, React, TypeScript, MUI, Vitest, Jest/Supertest, Bun.

## Global Constraints

- Use TypeScript strict mode and explicit types; do not add `any`.
- Use Auth0-validated `sub` as the only owner identifier; never accept or return `ownerId`.
- Keep all Prisma list and mutation queries owner-scoped; foreign collection IDs must still return `404`.
- Use existing MUI components and accessible labels.
- Use Bun and Node.js 22.12+ (below 23); commit `bun.lock` only when dependencies change.
- Do not add a database migration, endpoint, ranking, autocomplete, or tag search.
- Commit focused changes with an accurate Gitmoji subject.

---

## File structure

| File | Responsibility |
| --- | --- |
| `backend/src/bookmarks/dto/list-bookmarks-query.dto.ts` | Validates optional `q` list-search query. |
| `backend/src/bookmarks/bookmarks.service.ts` | Builds the owner-scoped title-or-notes Prisma predicate. |
| `backend/test/bookmarks.e2e-spec.ts` | Proves API matching, validation, filter composition, and privacy. |
| `frontend/src/routes/AllBookmarksPage.tsx` | Fetches, searches, groups, and renders all bookmarks. |
| `frontend/src/routes/AllBookmarksPage.test.tsx` | Tests grouping, requests, and search empty state. |
| `frontend/src/routes/BookmarksPage.tsx` | Adds search state and composes it with collection filtering. |
| `frontend/src/routes/BookmarksPage.test.tsx` | Tests the composed search request. |
| `frontend/src/App.tsx` | Registers `/all`. |
| `frontend/src/layout/AppShell.tsx` | Adds accessible navigation to `/all`. |
| `API_DESIGN.md` | Documents `q` semantics and combined filter behaviour. |

### Task 1: Owner-scoped bookmark list search

**Files:**
- Modify: `backend/src/bookmarks/dto/list-bookmarks-query.dto.ts`
- Modify: `backend/src/bookmarks/bookmarks.service.ts`
- Modify: `backend/test/bookmarks.e2e-spec.ts`
- Modify: `API_DESIGN.md`

**Interfaces:**
- Consumes: `GET /bookmarks` and `ListBookmarksQueryDto`.
- Produces: `GET /bookmarks?q=<term>&collectionId=<cuid>` returning only the current user's title-or-notes matches.

- [ ] **Step 1: Write the failing integration tests**

Create data owned by User A: a title match, a notes match, a collection-filter match, and a non-match; create the same term for User B. Assert title and notes matches return, `q` plus `collectionId` narrows results, a 121-character `q` returns `400`, and User A querying User B's collection with `q` returns `404`.

```ts
await request(app.getHttpServer())
  .get('/bookmarks')
  .query({ q: 'react', collectionId: ownedCollection.id })
  .set('Authorization', 'Bearer test-user-a')
  .expect(200)
  .expect(({ body }) => expect(body).toEqual([expect.objectContaining({ id: titleMatch.id })]))
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `bun --cwd backend test -- bookmarks.e2e-spec.ts`

Expected: FAIL because `q` is rejected as non-whitelisted or does not filter the list.

- [ ] **Step 3: Implement DTO validation and Prisma filtering**

Add `q?: string` using `@IsOptional()`, `@IsString()`, `@MaxLength(120)`, and `@Transform(({ value }) => typeof value === 'string' ? value.trim() : value)`. In `findAll`, only add this `OR` clause when `query.q` is non-empty:

```ts
...(query.q
  ? {
      OR: [
        { title: { contains: query.q } },
        { notes: { contains: query.q } },
      ],
    }
  : {}),
```

Keep the existing owned-collection check and created-at descending order.

- [ ] **Step 4: Document and verify API behaviour**

Document optional `q`, title-or-notes matching, 1–120 character validation, and its conjunction with `collectionId` in `API_DESIGN.md`.

Run: `bun --cwd backend test -- bookmarks.e2e-spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit the backend vertical slice**

```bash
git add backend/src/bookmarks/dto/list-bookmarks-query.dto.ts backend/src/bookmarks/bookmarks.service.ts backend/test/bookmarks.e2e-spec.ts API_DESIGN.md
git commit -m "✨ feat: search private bookmarks"
```

### Task 2: Add `/all` grouped bookmark view

**Files:**
- Create: `frontend/src/routes/AllBookmarksPage.tsx`
- Create: `frontend/src/routes/AllBookmarksPage.test.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/layout/AppShell.tsx`

**Interfaces:**
- Consumes: `GET /collections`, `GET /bookmarks?q=<encoded-term>`, `BookmarkCardGrid`, `LoadingState`, `ErrorState`, and `EmptyState`.
- Produces: `/all`, grouped by current-user collection and including `Uncategorised`.

- [ ] **Step 1: Write failing route tests**

Mock collections and bookmarks. Assert headings and cards for each matching collection, an `Uncategorised` group for `collectionId: null`, and that submitted `react` calls `/bookmarks?q=react`. Add an assertion for the search-aware empty state.

```tsx
fireEvent.change(screen.getByLabelText('Search bookmarks'), { target: { value: 'react' } })
fireEvent.submit(screen.getByRole('search'))
await waitFor(() => expect(api.get).toHaveBeenCalledWith('/bookmarks?q=react'))
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `bun --cwd frontend test -- AllBookmarksPage.test.tsx`

Expected: FAIL because `AllBookmarksPage` does not exist.

- [ ] **Step 3: Implement the focused page**

Create `AllBookmarksPage` with query state and a submit-based `<Box component="form" role="search">`. Load collections and `/bookmarks`, encode a non-empty trimmed query with `encodeURIComponent`, and group by collection ID. Render only non-empty collection sections, then a non-empty `Uncategorised` section. Reuse `BookmarkCardGrid` with a no-op delete callback because deletion remains on `/bookmarks`.

Use `LoadingState`, retryable `ErrorState`, and `EmptyState` with exact copy `No bookmarks match your search.` for a submitted no-result search; otherwise use existing no-bookmarks copy.

- [ ] **Step 4: Register navigation and verify the test passes**

Add `<Route path="all" element={<AllBookmarksPage />} />` and an **All bookmarks** navigation item before Collections with a bookmark icon.

Run: `bun --cwd frontend test -- AllBookmarksPage.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the all-bookmarks page**

```bash
git add frontend/src/routes/AllBookmarksPage.tsx frontend/src/routes/AllBookmarksPage.test.tsx frontend/src/App.tsx frontend/src/layout/AppShell.tsx
git commit -m "✨ feat: add grouped all bookmarks view"
```

### Task 3: Add search to the existing bookmarks page

**Files:**
- Modify: `frontend/src/routes/BookmarksPage.tsx`
- Modify: `frontend/src/routes/BookmarksPage.test.tsx`

**Interfaces:**
- Consumes: collection filter and `GET /bookmarks` with optional `q` and `collectionId`.
- Produces: accessible `Search bookmarks` control that combines with the selected filter.

- [ ] **Step 1: Write the failing composed-filter test**

Select a collection, enter `react`, submit, and assert the next request is `/bookmarks?collectionId=collection-1&q=react`.

```tsx
fireEvent.change(screen.getByLabelText('Filter collection'), { target: { value: 'collection-1' } })
fireEvent.change(screen.getByLabelText('Search bookmarks'), { target: { value: 'react' } })
fireEvent.submit(screen.getByRole('search'))
await waitFor(() => expect(api.get).toHaveBeenCalledWith('/bookmarks?collectionId=collection-1&q=react'))
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `bun --cwd frontend test -- BookmarksPage.test.tsx`

Expected: FAIL because the page has no search control or composed query request.

- [ ] **Step 3: Implement query composition**

Add draft and submitted search states. Build `URLSearchParams` from a selected collection ID except `all` and `none`, then add a trimmed submitted `q`. Keep `none` as a client-side uncategorised filter after fetching. Add a form labelled `Search bookmarks` and include submitted search in the loading effect dependencies. Preserve the existing retry and create/delete error behaviour.

- [ ] **Step 4: Verify frontend quality**

Run:

```bash
bun --cwd frontend test -- BookmarksPage.test.tsx AllBookmarksPage.test.tsx
bun run lint
bun run typecheck
bun run build
```

Expected: all commands exit `0`; report existing lint warnings separately.

- [ ] **Step 5: Commit the frontend search behaviour**

```bash
git add frontend/src/routes/BookmarksPage.tsx frontend/src/routes/BookmarksPage.test.tsx
git commit -m "✨ feat: filter bookmarks by search"
```

### Task 4: Verify the complete feature

**Files:**
- Modify: `TASKS.md`

**Interfaces:**
- Consumes: completed Tasks 1–3 and project quality scripts.
- Produces: verified status and completed checklist entries.

- [ ] **Step 1: Mark completed scope**

Check only the `/all` page and full-text search items in `TASKS.md`.

- [ ] **Step 2: Run full verification**

```bash
bun run test
bun run test:e2e
bun run lint
bun run typecheck
bun run build
```

Expected: all applicable checks pass. If E2E needs the local database, use the existing Docker Compose services and documented host override without printing credentials.

- [ ] **Step 3: Commit verification metadata**

```bash
git add TASKS.md
git commit -m "📝 docs: mark bookmark search complete"
```

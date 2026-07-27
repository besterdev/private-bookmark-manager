# Bookmarks Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a private bookmarks list/detail/create/delete workspace with collection filtering.

**Architecture:** Extend the shared client only if a method is missing. `BookmarksPage` owns filter, list, selection, and dialog state, fetching collections for filter/form choices and bookmarks for the active filter. Small feature components handle list, detail, and validated create UI.

**Tech Stack:** React 19, TypeScript, MUI 9, Auth0 React SDK, Vitest.

### Task 1: Implement Bookmark UI components with tests

**Files:**
- Create: `frontend/src/features/bookmarks/types.ts`
- Create: `frontend/src/features/bookmarks/BookmarkList.tsx`
- Create: `frontend/src/features/bookmarks/BookmarkDetail.tsx`
- Create: `frontend/src/features/bookmarks/BookmarkDialog.tsx`
- Create: `frontend/src/features/bookmarks/BookmarkDialog.test.tsx`

- [ ] Write a failing test for blank title/invalid URL validation and a trimmed valid submit.
- [ ] Implement typed bookmark display, external URL action, collection label, and form dialog.
- [ ] Run the component test and commit.

### Task 2: Connect BookmarksPage to authenticated API and filters

**Files:**
- Modify: `frontend/src/routes/BookmarksPage.tsx`
- Modify: `TASKS.md`

- [ ] Write a failing page test for the empty bookmark state.
- [ ] Implement collection loading, All/Uncategorized/collection filtering, bookmark loading, create, delete, error retry, and loading state.
- [ ] Mark bookmark list/detail/create/delete/filter tasks complete and keep selected-collection embedded bookmarks pending.
- [ ] Run frontend test, typecheck, and production build.
- [ ] Commit:

```bash
git add frontend/src/features/bookmarks frontend/src/routes/BookmarksPage.tsx TASKS.md
git commit -m "✨ feat: add bookmarks workspace"
```

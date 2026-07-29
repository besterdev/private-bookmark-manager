# Task 1 Report: Theme foundation and shared search presentation

## Implementation

- Added `appTheme` with the approved Smalt, Blaze Orange, and Mine Shaft tokens; Public Sans typography; 12px shape radius; restrained shadows; and overrides for MUI buttons, cards, chips, drawers, and text fields.
- Loaded Public Sans through Google Fonts preconnect and stylesheet links, and set the document title to `Private Bookmark Manager`.
- Added the presentational `BookmarkSearchToolbar` form with labelled search input, explicit submit callback, and optional child content for the collection filter.
- Replaced duplicated route search markup in `/all` and `/bookmarks` while preserving each route's local input, submitted search, filter, and API-request state.
- Refined bookmark cards with a labelled 16:9 fallback visual, focus-visible external link treatment, consistent card padding, and theme-provided lift transition.

## TDD evidence

### RED

`bun --cwd frontend test -- BookmarkSearchToolbar.test.tsx BookmarkCard.test.tsx`

Exited `1` as intended:

- `BookmarkSearchToolbar.test.tsx` could not resolve the not-yet-created toolbar.
- The new card assertion could not find `img` named `Bookmark preview for MUI`.

### GREEN

`bun --cwd frontend test -- BookmarkSearchToolbar.test.tsx BookmarkCard.test.tsx`

Exited `0`: 3 test files and 5 tests passed.

## Verification

- `bun --cwd frontend test -- BookmarkSearchToolbar.test.tsx BookmarkCard.test.tsx AllBookmarksPage.test.tsx BookmarksPage.test.tsx` — exited `0`; 5 files and 12 tests passed.
- `bun --cwd frontend typecheck` — exited `0`.
- `bun --cwd frontend test` — exited `0`; 17 files and 34 tests passed.
- `bun --cwd frontend lint` — exited `0`; reported three existing `react-hooks/exhaustive-deps` warnings in `CollectionDetail.tsx`, `BookmarksPage.tsx`, and `CollectionsPage.tsx`.
- `bun --cwd frontend build` — exited `0`; Vite warned that the local Node 22.3.0 runtime is below the repository's required Node 22.12+, and reported its standard >500 kB bundle advisory.
- `git diff --cached --check` — exited `0`.

## Files changed

- `frontend/index.html`
- `frontend/src/App.tsx`
- `frontend/src/theme.ts`
- `frontend/src/features/bookmarks/BookmarkSearchToolbar.tsx`
- `frontend/src/features/bookmarks/BookmarkSearchToolbar.test.tsx`
- `frontend/src/features/bookmarks/BookmarkCard.tsx`
- `frontend/src/features/bookmarks/BookmarkCard.test.tsx`
- `frontend/src/routes/AllBookmarksPage.tsx`
- `frontend/src/routes/BookmarksPage.tsx`

## Self-review

- Confirmed the staged diff is limited to the task's nine specified files and has no whitespace errors.
- Confirmed both routes retain route-owned query and filter state; the toolbar only forwards input and submit events.
- Confirmed the card remains a safe `target="_blank"` external link with `rel="noreferrer"`, and the fallback is non-focusable with an accessible label.
- No task-scope defects found in the staged diff.

## Concerns

- The host runtime is Node 22.3.0, below the project's declared minimum of 22.12.0; build still completed successfully but the environment should be upgraded before release verification.
- The lint warnings are outside this task's changed behavior and do not fail the command.

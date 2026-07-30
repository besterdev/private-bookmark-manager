# Task 2 Report: Align frontend effect dependencies

## Commit

- `928e9a3 🐛 fix: align frontend effect dependencies`

## Changes

- Stabilized the `load` callbacks in `BookmarksPage` and `CollectionsPage` with `useCallback`; their effects now depend on `load`.
- Derived `collectionId` in `CollectionDetail` and used it in the bookmark-loading effect and dependency list.
- Added/strengthened behavior coverage for submitted searches, collection retry paths, and changing a collection ID on rerender.
- Added test cleanup in `CollectionDetail.test.tsx` so independent renders do not leak between tests.

## Test-first evidence

- The requested behavior is already present before the dependency-only refactor, so its focused tests were expected to pass rather than provide a meaningful RED state.
- The first focused run after adding the new collection-detail test failed because previous test renders were not cleaned up, producing multiple `Work` headings. This was corrected in test setup without changing production code.
- The corrected pre-refactor focused run passed: 3 files, 12 tests.

## Commands and results

| Command | Result |
| --- | --- |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend lint` (before) | Passed with the expected three `react-hooks/exhaustive-deps` warnings: `BookmarksPage`, `CollectionsPage`, and `CollectionDetail`. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/routes/BookmarksPage.test.tsx src/routes/CollectionsPage.test.tsx src/features/collections/CollectionDetail.test.tsx` (before) | Passed: 3 files, 12 tests. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/routes/BookmarksPage.test.tsx src/routes/CollectionsPage.test.tsx src/features/collections/CollectionDetail.test.tsx` (after) | Passed: 3 files, 12 tests. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend lint` (after) | Passed with no warnings. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend typecheck` | Passed. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend build` | Passed; the pre-existing `Some chunks are larger than 500 kB after minification` warning remains for Task 3. |
| `git diff --check` | Passed before commit. |

## Scope notes

- No lint suppression comments were added.
- No backend, API, Auth0, route, product-flow, bundle, plan, specification, or ledger changes were made.
- The remaining Vite chunk-size warning was intentionally not changed because bundle splitting is Task 3.

## Follow-up review correction

### Commit

- `527f0d0 ✅ test: cover effect dependency rerenders`

### Changes

- Added explicit rerender coverage for `BookmarksPage` and `CollectionsPage` that switches to a distinct Auth0-derived API client and asserts the new client receives `/bookmarks` plus `/collections`, or `/collections`, respectively.
- Updated the `CollectionDetail` rerender test to use its callback's API contract and assert `/collections/c1/bookmarks` followed by `/collections/collection-2/bookmarks`.
- Kept production implementation unchanged.

### Results

| Command | Result |
| --- | --- |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/routes/BookmarksPage.test.tsx src/routes/CollectionsPage.test.tsx src/features/collections/CollectionDetail.test.tsx` | Passed: 3 files, 14 tests. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend lint` | Passed with no warnings. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend typecheck` | Passed. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend build` | Passed; the Task 3 500 kB chunk-size warning remains unchanged. |
| `git diff --check` | Passed before the follow-up commit. |

The first run of the newly added contracts failed because the test-only API factory routed initial renders to an undefined return. The factory was corrected without production changes; the rerun above is the final verification evidence.

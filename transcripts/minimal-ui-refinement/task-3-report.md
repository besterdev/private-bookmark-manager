# Task 3 Report: Shared bookmark deletion

## Status

Completed in commit `e0f8e67` (`🐛 fix: enable deletion from all bookmarks`).

## Implementation

- Added `BookmarkDeleteDialog`, shared by `/all` and `/bookmarks`, with the required `bookmark`, `onCancel`, and `onConfirm` interface.
- Replaced `/all`'s no-op card callbacks with route-local pending-bookmark state and an authenticated `DELETE /bookmarks/:id` request.
- Both routes remove a bookmark only after the DELETE request succeeds.
- Failed deletes preserve the card, close the confirmation modal so the existing `ErrorState` is accessible, and provide no retry control.
- Added shared-dialog callback tests and deletion success/failure coverage for both routes.

## TDD evidence

### RED

1. `bun --cwd frontend test -- BookmarkDeleteDialog.test.tsx AllBookmarksPage.test.tsx`
   - Exit 1 as expected.
   - `BookmarkDeleteDialog` could not be resolved because it did not exist.
   - Both `/all` deletion tests could not find the `Delete` confirmation button because cards still received a no-op callback.

2. `bun --cwd frontend test -- BookmarksPage.test.tsx`
   - Exit 1 as expected after adding the matching rejected-delete test.
   - The safe `ErrorState` was hidden from the accessibility tree while the delete modal remained open.

### GREEN

`bun --cwd frontend test -- BookmarkDeleteDialog.test.tsx AllBookmarksPage.test.tsx BookmarksPage.test.tsx`

- Exit 0: 3 test files passed, 12 tests passed.

`bun --cwd frontend typecheck`

- Exit 0.

## Additional verification

`bun --cwd frontend lint`

- Exit 0 with three existing React hooks dependency warnings, including one pre-existing warning in `BookmarksPage.tsx`.

`bun --cwd frontend build`

- Exit 0. Vite emitted its existing chunk-size advisory and warned that the active Node.js is `22.3.0`, below the project-required Node 22.12+.

`git diff --check`

- Exit 0; no whitespace errors.

## Files changed

- `frontend/src/features/bookmarks/BookmarkDeleteDialog.tsx`
- `frontend/src/features/bookmarks/BookmarkDeleteDialog.test.tsx`
- `frontend/src/routes/AllBookmarksPage.tsx`
- `frontend/src/routes/AllBookmarksPage.test.tsx`
- `frontend/src/routes/BookmarksPage.tsx`
- `frontend/src/routes/BookmarksPage.test.tsx`

## Self-review

- Confirmed no `onDelete={() => undefined}` remains on `/all`.
- Confirmed each route owns its authenticated API call and local item state.
- Confirmed the shared dialog only handles confirmation/cancellation, not route state or API access.
- Confirmed failed deletes preserve the bookmark and expose a non-retryable safe error accessibly.

## Concerns

- The active Node.js version is 22.3.0; it is below the repository's documented 22.12+ minimum even though the build completed.
- Existing lint hook-dependency warnings and Vite's chunk-size advisory remain outside this task's scope.

## Fix Round 1

### Status and commit

Completed in commit `99e05fe` (`🔒 fix: hide bookmark deletion error details`).

### Changes

- `frontend/src/routes/AllBookmarksPage.tsx`: DELETE failures now always expose the fixed client message `Unable to delete bookmark`.
- `frontend/src/routes/BookmarksPage.tsx`: DELETE failures now always expose the same fixed client message.
- `frontend/src/routes/AllBookmarksPage.test.tsx`: injects an unsafe-looking server message and proves it is not rendered.
- `frontend/src/routes/BookmarksPage.test.tsx`: adds the same disclosure regression coverage.
- Both routes retain the bookmark and omit Retry after DELETE failure.

### RED evidence

Commands:

```bash
PATH='/Users/thawatchai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" node --version
PATH='/Users/thawatchai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" bun --cwd frontend test -- AllBookmarksPage.test.tsx BookmarksPage.test.tsx
```

Output:

- Node: `v24.14.0`.
- Exit 1: 2 test files failed, 2 tests failed and 8 passed.
- Both failures received `Internal SQL error: ownerId=auth0|victim` where `Unable to delete bookmark` was required.

### GREEN and verification evidence

Commands:

```bash
PATH='/Users/thawatchai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" node --version
PATH='/Users/thawatchai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" bun --cwd frontend test -- BookmarkDeleteDialog.test.tsx AllBookmarksPage.test.tsx BookmarksPage.test.tsx
PATH='/Users/thawatchai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" bun --cwd frontend typecheck
PATH='/Users/thawatchai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" bun --cwd frontend lint
PATH='/Users/thawatchai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'"$PATH" bun --cwd frontend build
```

Output:

- Node: `v24.14.0`.
- Tests: exit 0; 3 test files passed, 12 tests passed.
- Typecheck: exit 0.
- Lint: exit 0 with the same three existing React hooks dependency warnings.
- Build: exit 0; Vite built 11,731 modules in 1.76 seconds with only the existing chunk-size advisory.
- `git diff --check`: exit 0.

### Self-review and concerns

- Confirmed only DELETE catch paths stopped propagating exception messages; load/create error behavior was not changed.
- Confirmed the unsafe server string exists only in tests and is explicitly asserted absent from the rendered page.
- The unsupported Node 22.3.0 verification concern is resolved by the clean rerun on bundled Node v24.14.0.
- Existing hook-dependency lint warnings and the Vite chunk-size advisory remain outside this fix's scope.

### Installed supported-runtime re-verification

Commands:

```bash
PATH='/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:'"$PATH" node --version
PATH='/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:'"$PATH" bun --cwd frontend test -- BookmarkDeleteDialog.test.tsx AllBookmarksPage.test.tsx BookmarksPage.test.tsx
PATH='/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:'"$PATH" bun --cwd frontend typecheck
PATH='/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:'"$PATH" bun --cwd frontend lint
PATH='/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:'"$PATH" bun --cwd frontend build
```

Results:

- Node: `v22.19.0`, matching the installed supported runtime requested for re-review.
- Tests: exit 0; 3 test files passed, 12 tests passed.
- Typecheck: exit 0.
- Lint: exit 0 with the same three existing React hooks dependency warnings.
- Build: exit 0; Vite built 11,731 modules in 1.35 seconds with only the existing chunk-size advisory.
- No source changes or additional commit were required.

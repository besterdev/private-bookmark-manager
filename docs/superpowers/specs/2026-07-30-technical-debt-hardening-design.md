# Technical Debt Hardening Design

## Scope

This change resolves the three known frontend technical-debt items:

1. User-facing error states can render untrusted transport error messages.
2. Three React Hook dependency warnings remain in bookmark and collection views.
3. The production frontend build emits a chunk-size warning.

## Goals

- Display fixed, task-specific error copy rather than a caught error message in every affected UI state.
- Remove the current `react-hooks/exhaustive-deps` warnings without suppressing lint rules.
- Split the frontend production bundle so Vite builds without its 500 kB chunk warning.
- Preserve all API contracts, authenticated behavior, route URLs, UI workflows, and existing private-data rules.

## Non-goals

- No change to backend error response shapes or `ApiError`.
- No new data-fetching library, retry system, error boundary, or logging service.
- No change to application features or visual design.
- No increase to Vite's chunk warning threshold to hide the warning.

## Safe error presentation

Affected components will discard caught exception details before rendering:

- `BookmarksPage`: `Unable to load bookmarks` and `Unable to create bookmark`.
- `CollectionsPage`: `Unable to load collections`, `Unable to create collection`, and `Unable to delete collection`.
- `CollectionDetail`: `Unable to load collection bookmarks`.
- `AuthGate`: `Unable to verify API access`.

Existing delete messages that are already fixed remain unchanged. Error details can remain inside `ApiError` for non-UI program logic, but no affected component will interpolate `cause.message` into an `ErrorState`.

Route and gate tests will use sensitive-looking server or transport strings and assert that the fixed message is visible while the sensitive string is absent.

## Hook dependencies

`BookmarksPage` and `CollectionsPage` will make their `load` functions stable with `useCallback` and use the callback as the effect dependency. The callbacks will declare every value used to build their request and update state.

`CollectionDetail` will derive a `collectionId` primitive before its effect. The effect will use that ID rather than the full collection object, allowing its dependency list to express the actual request identity: `collectionId`, `getBookmarks`, and `retry`.

No lint suppression comments will be introduced.

## Bundle splitting

`App` will lazy-load routed page modules and render a `Suspense` fallback using the existing `LoadingState`. The authenticated route URLs remain `/all`, `/collections`, `/bookmarks`, and `/callback`.

Vite will use deterministic manual chunks for React/router, Auth0, MUI core, MUI icons, and Emotion packages. This separates shared framework code from route chunks instead of raising the warning threshold. The resulting production build must not print Vite's chunk-size warning.

## Verification

- Focused tests prove safe error copy for every affected component and retain retry/create behavior.
- Existing application route tests continue to pass with lazy routes.
- `bun --cwd frontend lint` exits without warnings.
- `bun --cwd frontend typecheck`, `bun --cwd frontend test`, and `bun --cwd frontend build` pass.
- The production build output contains no `Some chunks are larger than 500 kB` warning.
- The full project lint, typecheck, test, and build checks pass on Node.js 22.19.0.

## Senior review criteria

Review must confirm that error strings cannot leak through the changed UI paths, effect dependencies represent actual behavior, dynamic imports preserve protected routing, chunking is deterministic and does not hide warnings, and no unrelated product behavior changed.

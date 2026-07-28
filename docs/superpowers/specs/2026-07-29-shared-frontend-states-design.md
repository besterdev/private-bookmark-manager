# Shared Frontend States and Tests Design

## Goal

Standardize loading, empty, and recoverable error UI across AuthGate, Collections, Bookmarks, and collection-bookmark detail views, then add regression tests for state and form/API behavior.

## Design

Create three presentational components in `frontend/src/components/states/`:

- `LoadingState`: centered MUI progress indicator with required accessible status text.
- `ErrorState`: MUI error alert with a required message and an optional Retry action.
- `EmptyState`: outlined, centered content with title, description, and an optional primary action.

The components receive display props and callbacks only. They do not fetch data, call Auth0, or depend on route state.

## Integration

- `AuthGate` uses `LoadingState` for Auth0 initialization and API-access verification, and `ErrorState` for Auth0/API-access failures. Login remains a local action because it is not a recoverable request.
- `CollectionsPage` uses all three components for initial loading, list-fetch errors with Retry, and no-collection onboarding.
- `BookmarksPage` uses `LoadingState` and `ErrorState` for page fetches; its existing card-grid empty message remains compact for an active filter result.
- `CollectionDetail` uses `LoadingState` and `ErrorState` when fetching selected collection bookmarks. Its collection-level empty grid remains unchanged.

## Test Coverage

- Unit-test each shared component's accessible copy and callbacks.
- Extend page tests to cover loading, error/retry, and empty states through mocked API clients.
- Extend form tests to cover client validation and rejected submit requests. A failed create must keep the dialog open and display the existing error alert.
- Keep existing Auth0, API contracts, design colors, routes, and data model unchanged.

## Out of Scope

- No global async-state hook or data-fetching library.
- No backend/API contract changes.
- No visual redesign beyond replacing duplicated state markup with equivalent shared components.

## Acceptance Criteria

- Every loading state communicates progress through accessible text.
- Every recoverable API error offers Retry and invokes the supplied callback.
- Empty Collections provides Create collection; empty Bookmarks remains filter-aware.
- AuthGate uses the same loading/error primitives as protected pages.
- Tests cover state rendering, Retry callbacks, invalid form submit, and failed create behavior.

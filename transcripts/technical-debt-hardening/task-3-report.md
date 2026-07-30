# Task 3 Report: Split frontend route and framework bundles

## Scope completed

- Replaced the four static page imports in `frontend/src/App.tsx` with `React.lazy` imports.
- Wrapped only the existing route tree in `Suspense`, retaining `AuthGate`, `BrowserRouter`, every route path, the index redirect, and `/callback`.
- Used the existing accessible `LoadingState` fallback with `label="Loading page…"` and `minHeight="100vh"`.
- Added deterministic Vite manual chunks for `mui-icons`, `mui-core`, `auth0`, and `react-router`. All unmatched module IDs return `undefined`; `chunkSizeWarningLimit` was not changed.
- Added an App-level fallback regression test. Its deferred route double resolves before test cleanup, so it leaves no pending promise.

## RED evidence

Baseline command:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend build
```

The baseline exited 0 but emitted `Some chunks are larger than 500 kB after minification` for `index-6n28fT44.js` at 751.79 kB. Before implementation, the new fallback assertion for `Loading page…` also failed because no route-level suspense fallback existed.

## Verification

All commands used Node.js 22.19.0 and exited 0:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/App.test.tsx
# 1 test file, 5 tests passed

PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend lint
# oxlint passed with no output

PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend typecheck
# tsc -b --pretty false passed

PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend build
# passed with no 500 kB chunk warning
```

The final build emitted named vendor chunks below the 500 kB threshold: `mui-icons` (1.23 kB), `auth0` (207.38 kB), `react-router` (218.29 kB), and `mui-core` (257.04 kB), plus separate route chunks for All Bookmarks, Bookmarks, Collections, and Callback.

## Not run

- Full frontend test suite was not run; Task 3 required the focused `src/App.test.tsx` suite.

# Axios transport migration — final review

## Outcome

**DONE_WITH_CONCERNS**

The Axios transport preserves the existing client interface, obtains the
current Auth0 access token per request, normalizes transport failures, and
keeps Bearer tokens on the configured API origin.

## Findings resolved

### High — token dispatch without a configured API origin

An empty or missing API base URL previously allowed an absolute request path
to proceed to token acquisition and dispatch. `createApiClient` now fails
closed with `API base URL is not configured` before Axios instance creation,
token acquisition, or adapter dispatch. The error exposes neither the
configuration value nor a token.

The real-adapter regression coverage also retains the earlier
`allowAbsoluteUrls: false` protection from commit `18b6add`, proving an
absolute-looking path cannot override a valid configured API origin.

Fail-closed fix: `d4e916b` — `🔒 fix: reject requests without API base URL`

### Medium — ignored review evidence

The plan briefs, reports, progress ledger, and review diff packages were stored
only under ignored `.superpowers` state. They are now preserved in this tracked
transcript directory with this final review.

## Verification

All final-wave commands used Node.js 22.19.0:

- Focused API-client tests: 2 files, 5 tests passed.
- Full frontend tests: 19 files, 47 tests passed.
- Frontend lint: exit 0 with three pre-existing hook dependency warnings.
- Frontend typecheck: passed.
- Frontend production build: passed with the existing chunk-size warning.
- `git diff --check`: passed.

## Pre-existing out-of-scope debt

- `AuthGate`, `BookmarksPage`, and `CollectionsPage` still render some caught
  exception messages directly instead of always using fixed safe UI copy.
- Three React hook dependency warnings remain in `CollectionDetail`,
  `BookmarksPage`, and `CollectionsPage`.
- The main frontend production chunk remains above Vite's 500 kB warning
  threshold.

These items predate the Axios migration and require separate behavior-focused
changes and regression coverage.

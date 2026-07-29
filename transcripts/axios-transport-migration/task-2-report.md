# Task 2 Senior Engineering Review Report

## Result

**DONE_WITH_CONCERNS**

Reviewed Task 1 commits `ebe8dbd` and `f47b7ed` against:

- `AGENTS.md`
- `API_DESIGN.md`
- `DECISIONS.md`
- `docs/superpowers/specs/2026-07-30-axios-frontend-client-design.md`
- `.superpowers/sdd/2026-07-30-axios-transport-migration/task-2-brief.md`

One actionable security finding was fixed in commit:

- `18b6add` — `🔒 fix: keep API tokens on configured origin`

## Findings

### High — fixed: absolute request URLs could receive the Auth0 Bearer token

Before `18b6add`, `frontend/src/lib/api-client.ts` created the Axios instance
with only `baseURL`. Axios allows an absolute request URL to override `baseURL`
by default, while the request interceptor still attaches the access token.
Although current callers construct relative paths, the public client accepted
an arbitrary string, so a future or compromised caller could send the token to
another origin.

The fix configures the private instance with `allowAbsoluteUrls: false`. An
adapter-level regression test now proves that an absolute-looking path resolves
under `https://api.example.test` and receives the token there, rather than
resolving to `https://attacker.example`.

TDD evidence:

1. RED:
   `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run --cwd frontend test -- src/lib/api-client.security.test.ts`
   failed because the adapter observed
   `https://attacker.example/collect` instead of
   `https://api.example.test/https://attacker.example/collect`.
2. GREEN:
   `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run --cwd frontend test -- src/lib/api-client.security.test.ts src/lib/api-client.test.ts`
   passed 2 files and 4 tests.

### No other actionable Task 1 findings

- Each `createApiClient` call creates one private Axios instance and installs
  one request and one response interceptor. No global interceptor lifecycle or
  ejection requirement exists.
- The token getter is awaited inside the request interceptor, so token
  acquisition occurs per request rather than at client creation.
- The implementation does not log tokens, headers, Axios configuration, or
  errors.
- Axios failures start as `unknown`, are checked with `axios.isAxiosError`, and
  response data is treated as an unknown message shape rather than `any`.
- Only string NestJS messages are retained. Array or malformed messages use the
  documented status fallback; this is intentional per the Task 2 brief and is
  covered by a test.
- HTTP, network, GET, POST, and DELETE behavior preserves the public client
  interface and unwraps response data inside the transport boundary.
- No route imports Axios or handles `AxiosResponse.data`.
- No retry, refresh, global singleton, service layer, or speculative
  abstraction was introduced.
- The new security test observes the real Axios adapter configuration; the
  focused client tests also cover returned values and request arguments rather
  than interceptor registration counts alone.

## Pre-existing concern outside the reviewed diff

The approved design says route components must render fixed safe messages, but
some unchanged callers still render `cause.message` directly:

- `frontend/src/auth/AuthGate.tsx`
- `frontend/src/routes/BookmarksPage.tsx`
- `frontend/src/routes/CollectionsPage.tsx`

This was not introduced by `ebe8dbd` or `f47b7ed`, and changing route error
behavior was outside this transport-only review. It should be handled as a
separate focused security-hardening task with route-level regression tests.

## Final verification on Node.js 22.19.0

All commands were run after commit `18b6add`.

| Check | Result | Evidence |
| --- | --- | --- |
| `bun run lint` | Passed with warnings | Exit 0. Frontend reported three pre-existing `react-hooks/exhaustive-deps` warnings in `CollectionDetail.tsx`, `BookmarksPage.tsx`, and `CollectionsPage.tsx`; backend exited 0. |
| `bun run typecheck` | Passed | Exit 0 for frontend and backend. |
| `bun run test` with the brief's Auth0 environment | Blocked in backend; frontend passed | Root exit 1. Frontend passed 19 files and 46 tests. Backend passed 4 of 5 suites and 15 of 17 tests, then failed because the sandbox rejected `listen 127.0.0.1` with `EPERM`; the JWKS `beforeAll` consequently exceeded 5000 ms and two auth tests timed out. Escalated loopback execution was unavailable, so the backend suite is not reported as passing. |
| `bun run build` | Passed with warning | Exit 0 for frontend and backend. Vite warned that the 751.90 kB minified application chunk exceeds 500 kB. |
| `git diff --check HEAD~1..HEAD` | Passed | Exit 0 with no output. |

The working tree was clean after verification.

## Final fix wave

### High — fixed: blank API base URL did not fail closed

`allowAbsoluteUrls: false` confines absolute-looking paths only when Axios has
a configured `baseURL`. With an empty or missing `VITE_API_BASE_URL`, the
client could still acquire a token and dispatch an absolute request.

`createApiClient` now throws the safe error
`API base URL is not configured` before creating the Axios instance. The error
contains no configuration value or token.

Commit: `d4e916b` — `🔒 fix: reject requests without API base URL`

TDD evidence:

1. RED:
   `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run --cwd frontend test -- src/lib/api-client.security.test.ts`
   failed because the blank-base absolute request reached the adapter instead
   of rejecting with the safe configuration error.
2. GREEN:
   `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run --cwd frontend test -- src/lib/api-client.security.test.ts src/lib/api-client.test.ts`
   passed 2 files and 5 tests. The regression test also proves the token getter
   and adapter are not called.

### Medium — fixed: ignored SDD evidence was not preserved

The plan briefs, reports, progress ledger, and review diff packages under the
ignored `.superpowers` directory are preserved in the tracked
`transcripts/axios-transport-migration` directory. The tracked package also
contains `final-review-report.md` with the final findings and out-of-scope
debt. No dependency trees or secrets were copied.

### Final frontend verification

| Check | Result |
| --- | --- |
| Focused API-client tests | Passed: 2 files, 5 tests. |
| Full frontend tests | Passed: 19 files, 47 tests. |
| Frontend lint | Exit 0 with the same three pre-existing React hook dependency warnings. |
| Frontend typecheck | Passed. |
| Frontend build | Passed with the existing 751.98 kB chunk-size warning. |
| `git diff --check` | Passed. |

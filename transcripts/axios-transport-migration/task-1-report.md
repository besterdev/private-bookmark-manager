# Task 1 Report: Axios transport migration

## Scope

Replaced `fetch` only inside `frontend/src/lib/api-client.ts`. Routes and AuthGate were not changed.

## RED evidence

Command:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/lib/api-client.test.ts
```

Result: failed with 3 failing tests. The existing client called `fetch`, causing `TypeError: fetch failed` for GET and POST, and did not install the Axios response interceptor (`Response interceptor was not installed`). This is the expected failure before the Axios implementation.

## Production change

- Added Axios as a frontend runtime dependency.
- Created an Axios instance using the configured `baseURL` inside `createApiClient`.
- Added a request interceptor that obtains and attaches the Auth0 bearer access token.
- Added a response rejection interceptor that converts Axios HTTP and network errors into `ApiError`.
- Returned transport-agnostic `get`, `post`, and `delete` methods that unwrap only `response.data`; DELETE resolves with no value.
- Used a string-only `message` guard so non-string API bodies fall back to the documented error message.

## Files changed

- `frontend/package.json`
- `bun.lock`
- `frontend/src/lib/api-client.ts`
- `frontend/src/lib/api-client.test.ts`

## Verification

| Command | Result |
| --- | --- |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/lib/api-client.test.ts` (RED) | Failed: 3/3 tests, for existing fetch transport and missing Axios interceptors. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/lib/api-client.test.ts` (GREEN) | Passed: 3/3 tests. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test` | Passed: 18 files, 45 tests. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend lint` | Passed with three existing `react-hooks/exhaustive-deps` warnings in collection/bookmark route files outside this task. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend typecheck` | Passed. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend build` | Passed with the existing Vite chunk-size warning (751.88 kB generated JS). |
| `git diff --check` | Passed. |

## Dependency installation note

The brief's `bun --cwd frontend add axios` was interpreted as a missing frontend script by Bun 1.3.14. The equivalent command, `bun add axios`, was run from `frontend/`; it installed `axios@1.18.1` and updated only `bun.lock` as the package-manager lockfile.

## Self-review

- Confirmed Axios configuration uses only `baseURL` and does not manually set `Content-Type`.
- Confirmed token ownership remains sourced from Auth0 through the existing `getAccessTokenSilently` callback.
- Confirmed HTTP and network failures are normalized while non-Axios failures are propagated unchanged.
- Confirmed no route or AuthGate code changed.
- Confirmed there are no whitespace errors and no additional package-manager lockfiles.

## Commit

`ebe8dbd ♻️ refactor: migrate API transport to Axios`

## Concerns

No migration-specific concerns. The verification output retains pre-existing hook-dependency and bundle-size warnings outside the changed API client.

## Fix Round 1

### Changed tests

- Asserted `get('/me')`, `post('/collections', { name: 'Work' })`, and `delete('/collections/collection-1')` are forwarded to the Axios instance exactly.
- Added an Axios HTTP failure where `response.data.message` is an array and asserted it becomes `ApiError` with status `400` and message `Request failed (400)`.

### Commands and results

| Command | Result |
| --- | --- |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/lib/api-client.test.ts` | Passed: 3/3 tests. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test` | Passed: 18 files, 45 tests. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend typecheck` | Passed. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend lint` | Passed with the same three pre-existing hook-dependency warnings outside the changed file. |
| `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend build` | Passed with the existing Vite chunk-size warning. |

The added tests were green immediately because the Task 1 Axios implementation already forwarded those arguments and used the required string-only response-message guard; therefore no production code change was needed.

### Commit

`f47b7ed ✅ test: cover Axios client transport errors`

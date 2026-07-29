### Task 2: Senior engineering review and final verification

**Files:**
- Review: `frontend/src/lib/api-client.ts`
- Review: `frontend/src/lib/api-client.test.ts`
- Review: `frontend/package.json`
- Review: `bun.lock`

**Interfaces:**
- Consumes: the Task 1 commit and the approved design at `docs/superpowers/specs/2026-07-30-axios-frontend-client-design.md`.
- Produces: a prioritized review report and, only when necessary, focused fixes with regression tests.

- [ ] **Step 1: Review the implementation against project standards**

Inspect the Task 1 diff for:

- one Axios instance and one interceptor pair per `createApiClient` call;
- access token acquisition on every request rather than at client creation;
- no token, headers, or Axios configuration in logs or rendered errors;
- correct `AxiosError` narrowing without `any`;
- string-only NestJS message extraction;
- safe fallback for network and malformed error responses;
- no Axios imports or `.data` handling in route components;
- no retry, refresh, global singleton, or speculative abstraction;
- tests that prove observable behavior rather than only mock invocation counts.

- [ ] **Step 2: Fix only actionable findings**

For each correctness, security, or maintainability finding:

1. Add or adjust a test that fails for the finding.
2. Run the focused test and verify RED.
3. Apply the smallest production fix.
4. Run the focused test and verify GREEN.
5. Commit with an appropriate Gitmoji subject.

If there are no actionable findings, do not create a review-only commit.

- [ ] **Step 3: Run final project checks**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run lint
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run typecheck
AUTH0_ISSUER_URL=https://example.auth0.com/ AUTH0_AUDIENCE=https://api.example.test PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run test
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run build
git diff --check HEAD~1..HEAD
```

Expected: all applicable checks pass on Node.js 22.19.0. Report warnings separately and never describe an unrun check as passing.

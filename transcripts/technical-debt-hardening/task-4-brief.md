### Task 4: Senior review and final verification

**Files:**
- Review: all Task 1-3 files and their tests.

**Interfaces:**
- Consumes: the approved design and all Task 1-3 commits.
- Produces: a prioritized review report; only actionable findings receive a focused test-first fix.

- [ ] **Step 1: Conduct senior review**

Check for raw caught error rendering, broken retry/create/delete states, stale closure or repeated-request behavior, lint suppressions, changed route URLs, fallback accessibility, static page imports, warning-threshold changes, and unsafe/non-deterministic manual chunk matching.

- [ ] **Step 2: Fix only actionable findings test-first**

For each finding, add a test that demonstrates the issue, run it to confirm failure, make the smallest fix, rerun the focused test, and commit with the matching Gitmoji.

- [ ] **Step 3: Run final project checks**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run lint
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run typecheck
AUTH0_ISSUER_URL=https://example.auth0.com/ AUTH0_AUDIENCE=https://api.example.test PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run test
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run build
git diff --check
```

Expected: all checks pass on Node.js 22.19.0, frontend lint prints no warnings, and Vite prints no chunk-size warning. Report any unrun check or pre-existing issue exactly.

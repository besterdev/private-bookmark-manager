### Task 5: Full verification and visual review

**Files:**
- Review only; no planned source changes.

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: verified frontend and repository status ready for merge review.

- [ ] **Step 1: Run automated verification**

```bash
bun --cwd frontend test
bun run lint
bun run typecheck
bun run build
```

Expected: every command exits `0`; report pre-existing warnings separately.

- [ ] **Step 2: Run focused browser review**

Using the authenticated local app, verify desktop and mobile widths for `/all`, `/collections`, and `/bookmarks`. Confirm navigation, focus order, search/filter submission, external-card links, delete confirmation, loading/empty/error surfaces, and no horizontal overflow.

- [ ] **Step 3: Inspect the final diff**

Run:

```bash
git diff --check main...HEAD
git status --short
git log --oneline main..HEAD
```

Expected: no whitespace errors, no uncommitted changes, and focused Gitmoji commits.

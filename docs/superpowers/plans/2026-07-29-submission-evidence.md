# Submission Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce reviewer-ready documentation and a redacted evidence trail for the Private Bookmark Manager submission.

**Architecture:** Documentation only. `README.md` explains local use; `AI_WORKFLOW.md` explains reviewed AI assistance; the transcript records high-level work without raw secrets; and the evidence matrix connects requirements to code and tests.

**Tech Stack:** Bun workspaces, Docker Compose, React/Vite, NestJS, Prisma, Auth0, Jest, Vitest.

## Global Constraints

- Use English for reviewer-facing documentation.
- Never include real secrets, tokens, passwords, or active database URLs.
- Reference environment variable names and `.env.example` only.
- Do not claim an operation passed unless the corresponding command succeeds in this task.

---

## File Structure

- Create `README.md`: setup, architecture, workflows, test commands, scope.
- Create `AI_WORKFLOW.md`: AI use, review gates, verification, redaction.
- Create `transcripts/submission-summary.md`: redacted project delivery record.
- Create `docs/submission-evidence.md`: requirement-to-source-and-test matrix.
- Modify `TASKS.md`: mark delivery items only after verification.

### Task 1: Create reviewer runtime documentation

**Files:**
- Create: `README.md`

- [ ] **Step 1: Document prerequisites and configuration**

Include Node `>=22.12 <23`, Bun, Docker Desktop, Auth0 SPA/API configuration, and `cp .env.example .env`. List variable names only.

- [ ] **Step 2: Document run and quality commands**

```bash
bun install
docker compose up --build
bun run dev
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

- [ ] **Step 3: Document features, privacy model, and intentional exclusions**

Describe owner-scoped collections/bookmarks, `404` for foreign resources, collection deletion preserving bookmarks, and no collection-sharing feature.

- [ ] **Step 4: Commit README**

```bash
git add README.md
git commit -m "📝 docs: add reviewer README"
```

### Task 2: Create AI and evidence records

**Files:**
- Create: `AI_WORKFLOW.md`
- Create: `transcripts/submission-summary.md`
- Create: `docs/submission-evidence.md`

- [ ] **Step 1: Write AI workflow**

Document spec/plan/implementation/test/review/merge stages and human approval gates. State that all secrets are excluded.

- [ ] **Step 2: Write redacted transcript summary**

Record the major delivery slices: Auth0, database, collections, bookmarks, card-grid UI, error contract, frontend states, and E2E. Do not reproduce raw prompts or configuration values.

- [ ] **Step 3: Write requirement evidence matrix**

For every core requirement include source path, test path, and command. Include authorization, private CRUD, filtering, deletion, frontend states, and real Auth0 integration.

- [ ] **Step 4: Commit records**

```bash
git add AI_WORKFLOW.md transcripts/submission-summary.md docs/submission-evidence.md
git commit -m "📝 docs: add submission evidence"
```

### Task 3: Verify docs and delivery evidence

**Files:**
- Modify: `TASKS.md`

- [ ] **Step 1: Review docs against API and source**

Check README and evidence matrix against `API_DESIGN.md`, `DECISIONS.md`, API routes, and test file names.

- [ ] **Step 2: Run verification**

```bash
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

- [ ] **Step 3: Review commits and update checklist**

Mark submission evidence, AI workflow, transcript, README, docs verification, verification commands, and commit-history review complete.

- [ ] **Step 4: Commit checklist**

```bash
git add TASKS.md
git commit -m "📝 docs: mark submission evidence complete"
```

## Verification

- [ ] Confirm no secret-like values appear in the new documentation.
- [ ] Run all documented quality commands.
- [ ] Confirm each claim in the evidence matrix links to an existing source or test file.

## Self-review

- Spec coverage: Tasks 1–3 cover all approved submission deliverables.
- Placeholder scan: Documentation references only actual scripts and source paths.
- Scope: No production behavior or API contract changes are introduced.

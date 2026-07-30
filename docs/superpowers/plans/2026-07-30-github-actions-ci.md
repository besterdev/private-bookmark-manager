# GitHub Actions CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run all project quality gates for every pull request targeting `main`.

**Architecture:** A single GitHub Actions `quality` job checks out a pull-request commit, provisions Node 22.19.0, Bun, and a disposable MySQL 8.4 service, then executes the existing workspace checks in dependency order. The workflow provides fixed test-only configuration values and runs backend ESLint directly to avoid the existing mutating `--fix` script.

**Tech Stack:** GitHub Actions, Ubuntu, Node.js 22.19.0, Bun, Prisma, NestJS, Vitest, Jest.

## Global Constraints

- Trigger only on `pull_request` events targeting `main`.
- Use Node.js `22.19.0` and `bun ci`.
- Never expose credentials, access tokens, or database URLs.
- Use `bun x eslint "{src,apps,libs,test}/**/*.ts"` from `backend/` instead of the mutating backend lint script.
- Provide a disposable MySQL 8.4 service and test-only `DATABASE_URL=mysql://ci:ci@127.0.0.1:3306/bookmarks`, `AUTH0_ISSUER_URL=https://example.auth0.com/`, and `AUTH0_AUDIENCE=https://api.example.test` for Prisma and backend test commands.
- Do not change application behavior, dependencies, or test semantics.

---

### Task 1: Add pull-request quality workflow and delivery documentation

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `README.md:68-78`
- Modify: `README.md:99-103`
- Modify: `TASKS.md:134-139`
- Modify: `transcripts/github-actions-ci/session.md`

**Interfaces:**
- Consumes: root commands `bun run typecheck`, `bun run test`, `bun run test:e2e`, and `bun run build`; backend Prisma and ESLint CLIs.
- Produces: a required GitHub Actions check named `Quality` for every pull request with base `main`.

- [ ] **Step 1: Establish the failing workflow-validation baseline**

Run:

```bash
test -f .github/workflows/ci.yml
```

Expected: fail because the workflow file does not exist.

- [ ] **Step 2: Create the minimal CI workflow**

Create `.github/workflows/ci.yml` with the following behavior:

```yaml
name: Quality

on:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  quality:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.4
        env:
          MYSQL_DATABASE: bookmarks
          MYSQL_USER: ci
          MYSQL_PASSWORD: ci
          MYSQL_ROOT_PASSWORD: ci-root
        ports: [3306:3306]
        options: >-
          --health-cmd="mysqladmin ping -h 127.0.0.1 -uroot -pci-root"
          --health-interval=5s --health-timeout=5s --health-retries=20
    env:
      DATABASE_URL: mysql://ci:ci@127.0.0.1:3306/bookmarks
      AUTH0_ISSUER_URL: https://example.auth0.com/
      AUTH0_AUDIENCE: https://api.example.test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22.19.0
      - uses: oven-sh/setup-bun@v2
      - run: bun ci
      - run: bun x prisma generate
        working-directory: backend
      - run: bun x prisma migrate deploy
        working-directory: backend
      - run: bun x eslint "{src,apps,libs,test}/**/*.ts"
        working-directory: backend
      - run: bun --cwd frontend lint
      - run: bun run typecheck
      - run: bun run test
      - run: bun run test:e2e
      - run: bun run build
```

- [ ] **Step 3: Validate the workflow contract**

Run:

```bash
rg -n "pull_request:|branches: \[main\]|node-version: 22.19.0|bun ci|prisma generate|--fix|bun run typecheck|bun run test:e2e|bun run build" .github/workflows/ci.yml
```

Expected: output contains the pull-request trigger, Node/Bun setup, MySQL service, Prisma generation, migration deployment, and every quality command; it contains no `--fix` entry.

Run the exact CI quality commands locally under Node 22.19.0:

```bash
cd backend && DATABASE_URL=mysql://ci:ci@127.0.0.1:3306/bookmarks bun x prisma generate
cd backend && DATABASE_URL=mysql://ci:ci@127.0.0.1:3306/bookmarks bun x prisma migrate deploy
cd backend && bun x eslint "{src,apps,libs,test}/**/*.ts"
bun --cwd frontend lint
bun run typecheck
DATABASE_URL=mysql://ci:ci@127.0.0.1:3306/bookmarks AUTH0_ISSUER_URL=https://example.auth0.com/ AUTH0_AUDIENCE=https://api.example.test bun run test
DATABASE_URL=mysql://ci:ci@127.0.0.1:3306/bookmarks AUTH0_ISSUER_URL=https://example.auth0.com/ AUTH0_AUDIENCE=https://api.example.test bun run test:e2e
bun run build
```

Expected: each command succeeds. This configuration-only change is exempt from an automated unit test; the workflow contract and its exact command sequence are validated instead.

- [ ] **Step 4: Document CI availability and update task evidence**

Replace the README sentence stating CI is excluded with a `## Continuous integration` section explaining that pull requests to `main` run install, Prisma generation, non-mutating lint, typecheck, unit/integration tests, E2E tests, and build. Mark `Add CI pipeline` complete in `TASKS.md` and append the final command results and commit to `transcripts/github-actions-ci/session.md`.

- [ ] **Step 5: Commit the focused delivery**

```bash
git add .github/workflows/ci.yml README.md TASKS.md transcripts/github-actions-ci/session.md
git commit -m "👷 ci: validate pull requests to main"
```

## Plan self-review

- Spec coverage: Task 1 implements the required pull-request trigger, Node/Bun setup, reproducible install, Prisma generation, non-mutating lint, typecheck, tests, E2E tests, build, documentation, and transcript evidence.
- Placeholder scan: no unresolved placeholders or deferred implementation steps remain.
- Type consistency: every command is defined by the root or backend/frontend package scripts, or is an installed CLI provided by the workspace.

# Feature Branch Delivery Workflow

## Branching model

`main` remains the integrated, verified branch. Every deliverable is implemented in one dedicated feature branch and isolated worktree. Merge only after the feature's automated checks and review pass.

```text
main
 ├── chore/project-setup
 ├── feat/api-spec-and-auth
 ├── feat/database-prisma
 ├── feat/backend-collections
 ├── feat/backend-bookmarks
 ├── feat/frontend-shell-and-auth
 ├── feat/frontend-collections
 ├── feat/frontend-bookmarks
 ├── test/authorization-integration
 ├── test/private-bookmark-e2e
 └── docs/submission-evidence
```

## Delivery order

| Order | Branch | Scope | Required merge gate |
| ---: | --- | --- | --- |
| 1 | `chore/project-setup` | Bun workspace, React/Vite/MUI, NestJS, `/healthz`, root commands | frontend/backend build and initial unit tests |
| 2 | `feat/api-spec-and-auth` | Auth0 discovery/JWKS decision, API design, JWT validation guard, `/me` contract | auth unit tests and documented token rationale |
| 3 | `feat/database-prisma` | Prisma schema, migrations, two-user seed data | migration, seed, and schema validation |
| 4 | `feat/backend-collections` | owner-scoped Collections CRUD and deletion behaviour | unit/integration tests including ownership denial |
| 5 | `feat/backend-bookmarks` | owner-scoped Bookmarks CRUD, filters, collection relation | unit/integration tests including ownership denial |
| 6 | `feat/frontend-shell-and-auth` | MUI theme, responsive app shell, Auth0 login/callback/logout, protected routes | frontend tests, typecheck, build |
| 7 | `feat/frontend-collections` | collection list/detail/create/delete interface | component tests and API-state handling |
| 8 | `feat/frontend-bookmarks` | bookmark list/detail/create/delete/filter interface | component tests and API-state handling |
| 9 | `test/authorization-integration` | cross-user API privacy harness | User A cannot list/read/update/delete User B data |
| 10 | `test/private-bookmark-e2e` | browser flows for login and bookmark management | Playwright critical-path tests |
| 11 | `docs/submission-evidence` | API design, decisions, AI workflow, transcripts, README | runnable commands match documentation |

## Per-feature workflow

1. Create a branch from the current `main` and a matching isolated worktree.
2. Write a focused implementation plan and tests before implementation.
3. Implement only the branch scope; do not pull later features forward.
4. Run the branch's merge gate and document exact results.
5. Review diff against `main`, fix findings, then merge to `main` with a meaningful merge commit.
6. Remove the worktree after successful merge.

## Merge rules

- Never merge a branch with failing lint, typecheck, tests, or build relevant to its scope.
- API and data branches require an ownership-isolation test before merge.
- Frontend branches must preserve the approved MUI design system and responsive behaviour.
- Keep commit history honest: scaffold, feature, test, and corrective commits remain separate.
- Every commit subject follows the Gitmoji convention in `AGENTS.md`; use `🔀 merge:` for verified feature-branch merges.
- Every new branch starts from latest `main`, not another unmerged feature branch, unless its dependency requires it and the dependency branch is named explicitly.

## Current state

- `main`: project documentation baseline committed.
- `chore/project-setup`: isolated worktree created at `.worktrees/project-setup`; implementation has not started.

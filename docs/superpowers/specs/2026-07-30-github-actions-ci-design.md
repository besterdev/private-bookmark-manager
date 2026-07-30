# GitHub Actions CI Design

## Goal

Run the project's required quality checks automatically for every pull request targeting `main`.

## Scope

Create one GitHub Actions workflow at `.github/workflows/ci.yml`. It runs only on the `pull_request` event when the pull request base branch is `main`.

The workflow uses Ubuntu, Node.js `22.19.0`, Bun, and a disposable MySQL 8.4 service. It installs dependencies reproducibly with `bun ci`, generates the Prisma client, applies committed migrations, and then runs the existing repository quality commands.

## Workflow

The single `quality` job runs these steps in order:

1. Check out the pull-request commit.
2. Set up Node.js `22.19.0`.
3. Set up Bun.
4. Install the lockfile-pinned workspace dependencies with `bun ci`.
5. Start a disposable MySQL 8.4 service with a health check.
6. Run `bun x prisma generate` and `bun x prisma migrate deploy` from `backend/`.
7. Run a non-mutating lint command for the backend and the existing frontend lint script. The backend's `lint` script is intentionally not used because it includes `--fix`.
8. Run `bun run typecheck`.
9. Run `bun run test` with test-only `DATABASE_URL`, `AUTH0_ISSUER_URL`, and `AUTH0_AUDIENCE` environment variables.
10. Run `bun run test:e2e` against the disposable MySQL service.
11. Run `bun run build`.

The checks use deterministic test fixtures and mocked authentication boundaries. MySQL credentials are fixed test-only values scoped to the disposable CI service. The workflow does not access live Auth0, Docker, or repository secrets.

## Documentation

Update `README.md` to state that pull requests to `main` run CI and to list the covered checks. Update `TASKS.md` to mark the CI optional bonus complete.

## Error handling and success criteria

Each command exits non-zero on failure, which fails the pull-request check and stops later steps. CI is successful only when all install, Prisma generation, lint, typecheck, unit/integration, E2E, and build steps pass.

## Constraints

- Do not expose credentials, access tokens, or database URLs.
- Use `bun ci`; do not replace the Bun lockfile or package manager.
- Do not use a mutating lint command in CI.
- Do not change application behavior, dependency versions, or test semantics.

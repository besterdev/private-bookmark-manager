# GitHub Actions CI Design

## Goal

Run the project's required quality checks automatically for every pull request targeting `main`.

## Scope

Create one GitHub Actions workflow at `.github/workflows/ci.yml`. It runs only on the `pull_request` event when the pull request base branch is `main`.

The workflow uses Ubuntu, Node.js `22.19.0`, and Bun. It installs dependencies reproducibly with `bun ci`, generates the Prisma client, and then runs the existing repository quality commands.

## Workflow

The single `quality` job runs these steps in order:

1. Check out the pull-request commit.
2. Set up Node.js `22.19.0`.
3. Set up Bun.
4. Install the lockfile-pinned workspace dependencies with `bun ci`.
5. Run `bun --cwd backend x prisma generate`.
6. Run a non-mutating lint command for the backend and the existing frontend lint script. The backend's `lint` script is intentionally not used because it includes `--fix`.
7. Run `bun run typecheck`.
8. Run `bun run test` with placeholder `AUTH0_ISSUER_URL` and `AUTH0_AUDIENCE` environment variables required by the backend test suite.
9. Run `bun run test:e2e` with the same placeholder Auth0 environment variables.
10. Run `bun run build`.

The checks use deterministic test fixtures and mocked authentication boundaries. The workflow does not access live Auth0, a database service, Docker, or repository secrets.

## Documentation

Update `README.md` to state that pull requests to `main` run CI and to list the covered checks. Update `TASKS.md` to mark the CI optional bonus complete.

## Error handling and success criteria

Each command exits non-zero on failure, which fails the pull-request check and stops later steps. CI is successful only when all install, Prisma generation, lint, typecheck, unit/integration, E2E, and build steps pass.

## Constraints

- Do not expose credentials, access tokens, or database URLs.
- Use `bun ci`; do not replace the Bun lockfile or package manager.
- Do not use a mutating lint command in CI.
- Do not change application behavior, dependency versions, or test semantics.

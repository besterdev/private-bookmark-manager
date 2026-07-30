# GitHub Actions CI - Agent Session Record

## Request

The user requested a CI pipeline after reviewing the remaining optional work.

## Clarification

The workflow must run only for pull requests whose base branch is `main`.

## Design decision

The approved design is one GitHub Actions `quality` job on Ubuntu using Node.js `22.19.0` and Bun. It will install with `bun ci`, generate Prisma, run non-mutating lint, typecheck, unit/integration tests, E2E tests, and build. It will use placeholder Auth0 test environment values only and no secrets or external services.

## Evidence

- Design specification: `docs/superpowers/specs/2026-07-30-github-actions-ci-design.md`
- Design commit: `b0ce61d` (`📝 docs: design pull request CI`)

## Status

The design specification is committed and awaiting the user's written-spec review. No CI workflow has been implemented yet.

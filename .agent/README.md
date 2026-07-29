# Reusable Agent Playbooks

## Purpose

Route each change to one focused repository-local playbook so implementation and review follow the project's security, UI, and verification rules.

## Use when

- Use [Backend API and security](backend-api-security.md) for NestJS, Prisma, Auth0, endpoint, DTO, migration, or backend-test work.
- Use [Frontend UI and tests](frontend-ui-tests.md) for React, MUI, routes, API-consumer, accessibility, responsive UI, or Vitest work.
- Use [Quality review](quality-review.md) for a read-only pre-merge assessment and verification report.
- Use the frontend playbook and then the quality-review playbook when a frontend change affects visible UI, navigation, interactions, accessibility, or shared states.

## Read first

Read `AGENTS.md`, `API_DESIGN.md`, `DECISIONS.md`, and `AI_WORKFLOW.md`. Also read the relevant approved design specification and existing tests before changing code.

## Guardrails

- Use Bun for dependency management and commands; keep TypeScript strict.
- Never expose secrets, access tokens, database credentials, or connection strings.
- Keep frontend and backend boundaries explicit: the frontend calls documented HTTP endpoints only and never accesses Prisma or the database.
- Work in a feature worktree with focused Gitmoji commits; preserve unrelated changes and obtain approval before merging.

## Workflow

1. Select one primary playbook based on the requested change.
2. Follow its scoped workflow and add relevant tests and documentation updates.
3. Escalate ambiguous product or security decisions to `DECISIONS.md` before implementation.
4. Use the review playbook before merge when the change has implementation impact.

## Commands

Run the narrowest relevant command first, then the applicable workspace checks:

```bash
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

## Definition of done

The selected playbook's checks pass or are reported exactly, documentation matches the behavior, privacy is preserved, and no secrets are exposed.

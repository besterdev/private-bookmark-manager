# Backend API and Security Playbook

## Purpose

Safely change NestJS APIs, Auth0 authentication, Prisma data access, and backend tests while preserving strict per-user privacy.

## Use when

Use for controllers, services, DTOs, guards, Auth0 validation, Prisma schema or migrations, API contracts, and Jest or Supertest coverage.

## Read first

Read `AGENTS.md`, `API_DESIGN.md`, `DECISIONS.md`, and `AI_WORKFLOW.md`, then inspect the affected implementation and tests.

## Guardrails

- Use Bun and strict TypeScript; never expose secrets, tokens, or database credentials.
- Require a validated Auth0 **access token**, not an ID token. Verify issuer, audience, RS256 signature through JWKS, expiry, algorithm, and a non-empty `sub`.
- Derive the authenticated owner only from the validated Auth0 `sub`; never accept `ownerId` from request input.
- Include owner scope in every Prisma read and mutation. Foreign or missing resources must return the same `404` behavior so existence cannot be inferred.
- Validate create, replace, patch, and filter input with DTOs and retain the documented error shape.
- Keep collection deletion behavior: delete the collection, clear `Bookmark.collectionId`, and preserve bookmarks.
- Keep database access on the backend and document every public HTTP contract in `API_DESIGN.md`.

## Workflow

1. Define the requested behavior, ownership rule, validation rule, and failure response.
2. Update `API_DESIGN.md` and `DECISIONS.md` when a contract or decision changes.
3. Implement authenticated controller and service behavior with owner-scoped Prisma queries.
4. Add unit or integration coverage for valid input, invalid input, and two-user isolation.
5. Confirm User A cannot list, read, create against, update, delete, filter, or infer User B's collections or bookmarks.
6. Run focused backend checks, then applicable workspace checks, and report exact outcomes.

## Commands

```bash
bun --cwd backend test
bun --cwd backend run lint
bun --cwd backend run typecheck
bun run test
bun run test:e2e
bun run build
```

Use the narrowest affected test file or suite before the broader commands.

## Definition of done

Auth0 identity is validated from `sub`, all resource access is owner-scoped, foreign access returns `404`, DTO validation and API documentation match behavior, two-user tests cover isolation, and applicable checks have exact reported results.

# Submission Evidence

| Requirement | Implementation evidence | Test evidence |
| --- | --- | --- |
| Auth0 access-token validation | `backend/src/auth/auth0-jwt.service.ts`, `backend/src/auth/auth.guard.ts` | `backend/src/auth/auth0-jwt.service.spec.ts`, `backend/src/auth/auth.guard.spec.ts` |
| Current authenticated user | `backend/src/users/users.controller.ts`, `backend/src/users/users.service.ts` | `backend/test/authorization.e2e-spec.ts` |
| Private collection CRUD | `backend/src/collections/` | `backend/src/collections/collections.service.spec.ts`, `backend/test/collections.e2e-spec.ts` |
| Private bookmark CRUD | `backend/src/bookmarks/` | `backend/src/bookmarks/bookmarks.service.spec.ts`, `backend/test/bookmarks.e2e-spec.ts` |
| Owner isolation and non-disclosure | owner-scoped Prisma queries in collection/bookmark services | `backend/test/collections.e2e-spec.ts`, `backend/test/bookmarks.e2e-spec.ts` |
| Collection filtering and nested bookmarks | `backend/src/bookmarks/bookmarks.controller.ts`, `backend/src/bookmarks/collection-bookmarks.controller.ts` | `backend/test/bookmarks.e2e-spec.ts` |
| Collection deletion preserves bookmarks | Prisma relation configuration in `backend/prisma/schema.prisma` | `backend/test/collections.e2e-spec.ts` |
| Validation and common errors | DTOs in `backend/src/**/dto/`, `backend/src/main.ts` | `backend/test/collections.e2e-spec.ts` |
| Authenticated frontend and API verification | `frontend/src/auth/AuthGate.tsx`, `frontend/src/lib/api-client.ts` | `frontend/src/auth/AuthGate.test.tsx`, `frontend/src/lib/api-client.test.ts` |
| Collection and bookmark UI states | `frontend/src/components/states/`, `frontend/src/routes/` | route, dialog, card, and state tests below `frontend/src/` |
| Docker runtime | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile` | Compose configuration and local container verification |

## Verification commands

```bash
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

The project documents API behavior in [API_DESIGN.md](../API_DESIGN.md) and product/security decisions in [DECISIONS.md](../DECISIONS.md).

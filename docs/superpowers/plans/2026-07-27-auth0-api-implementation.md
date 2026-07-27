# Auth0 API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect backend application routes with real Auth0 RS256 access-token validation and expose a trusted `GET /me` endpoint.

**Architecture:** NestJS keeps `/healthz` public and applies an Auth0 guard only to application controllers. The guard delegates token verification to a focused service using a cached remote JWKS, then exposes a narrow verified-claims object to handlers. `/me` upserts the verified Auth0 subject into MySQL and returns that user profile.

**Tech Stack:** Node.js 22.12+, TypeScript strict mode, NestJS 11, `jose`, Prisma 7, MySQL 8.4, Bun.

## Global Constraints

- Accept only Auth0 access tokens for issuer `https://dev-yg.us.auth0.com/` and audience `https://bbl-candidate-test-api`.
- Allow only the `RS256` algorithm and verify signatures with the issuer JWKS.
- Derive ownership exclusively from verified `sub`; never accept `ownerId` from request input.
- Keep `/healthz` public; all application routes use the guard.
- Put only placeholders in `.env.example`; do not commit secrets or access tokens.
- Automated tests are deferred for this setup phase; run typecheck and build instead.

---

### Task 1: Rebase the feature branch and add the API contract documents

**Files:**
- Create: `API_DESIGN.md`
- Create: `DECISIONS.md`
- Modify: `TASKS.md`

**Interfaces:**
- Consumes: `AUTH0_ISSUER_URL` and `AUTH0_AUDIENCE` runtime configuration.
- Produces: a documented `GET /me` contract and ADR-001 for access-token validation.

- [ ] **Step 1: Rebase onto database setup**

Run:

```bash
git rebase main
```

Expected: the feature branch contains the Prisma module, User model, Docker configuration, and current project setup from `main`.

- [ ] **Step 2: Add the API contract**

Create `API_DESIGN.md` with these requirements:

```markdown
## Authentication

All API endpoints except `GET /healthz` require `Authorization: Bearer <access-token>`.
The backend validates issuer, audience, expiry, RS256 signature, and a non-empty `sub` claim.

## Current user

### `GET /me`

Response `200`:
```json
{ "id": "auth0|subject", "email": "user@example.com", "name": "User" }
```
```

- [ ] **Step 3: Record the access-token decision**

Create `DECISIONS.md` with ADR-001 stating that the API accepts Auth0 access tokens rather than ID tokens because only access tokens are issued for the API audience.

- [ ] **Step 4: Update the feature checklist**

Mark the Auth0 discovery/JWKS inspection, access-token decision, API design, `/me` contract, and authentication configuration items as complete only after the implementation steps below are verified.

- [ ] **Step 5: Commit**

```bash
git add API_DESIGN.md DECISIONS.md TASKS.md
git commit -m "📝 docs: define Auth0 API contract"
```

### Task 2: Add Auth0 server configuration and JWT dependencies

**Files:**
- Modify: `backend/package.json`
- Modify: `backend/.env.example`
- Modify: `bun.lock`

**Interfaces:**
- Consumes: `AUTH0_ISSUER_URL` and `AUTH0_AUDIENCE`.
- Produces: `jose` available to `Auth0JwtService` and documented server-only environment values.

- [ ] **Step 1: Install the JWT library**

Run:

```bash
bun add --cwd backend jose
```

- [ ] **Step 2: Add safe environment placeholders**

Append to `backend/.env.example`:

```dotenv
AUTH0_ISSUER_URL="https://<AUTH0_DOMAIN>/"
AUTH0_AUDIENCE="https://<AUTH0_API_IDENTIFIER>"
```

- [ ] **Step 3: Commit**

```bash
git add backend/package.json backend/.env.example bun.lock
git commit -m "🔧 chore: configure Auth0 API validation"
```

### Task 3: Implement verified Auth0 claims and the NestJS guard

**Files:**
- Create: `backend/src/auth/auth0-jwt.service.ts`
- Create: `backend/src/auth/auth.guard.ts`
- Create: `backend/src/auth/auth.module.ts`
- Create: `backend/src/auth/current-user.decorator.ts`
- Create: `backend/src/auth/authenticated-request.interface.ts`

**Interfaces:**
- Consumes: `verifyAccessToken(token: string): Promise<VerifiedAuth0Claims>`.
- Produces: `request.user: VerifiedAuth0Claims` for guarded controllers.

- [ ] **Step 1: Define verified claims and request shape**

Create `authenticated-request.interface.ts`:

```ts
import type { Request } from 'express';

export interface VerifiedAuth0Claims {
  sub: string;
  email?: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user: VerifiedAuth0Claims;
}
```

- [ ] **Step 2: Create the verifier service**

Create `auth0-jwt.service.ts` with a `verifyAccessToken(token: string)` method. It must use `createRemoteJWKSet(new URL(`${issuer}.well-known/jwks.json`))` and `jwtVerify` from `jose` with:

```ts
{
  issuer: process.env.AUTH0_ISSUER_URL,
  audience: process.env.AUTH0_AUDIENCE,
  algorithms: ['RS256'],
}
```

Reject a missing or non-string `sub` claim with `UnauthorizedException`. Return only `sub`, `email`, and `name`; do not pass the entire JWT payload to controllers.

- [ ] **Step 3: Create the guard and current-user decorator**

Create `auth.guard.ts` so it accepts exactly one `Authorization` header with `Bearer <token>`, calls `verifyAccessToken`, assigns `request.user`, and throws `UnauthorizedException` for every invalid token path. Create `current-user.decorator.ts` using `createParamDecorator` to return `request.user`.

- [ ] **Step 4: Export the auth boundary**

Create `auth.module.ts` that provides and exports `Auth0JwtService` and `AuthGuard`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/auth
git commit -m "🔐 feat: add Auth0 JWT guard"
```

### Task 4: Create the current-user endpoint and persist verified users

**Files:**
- Create: `backend/src/users/users.controller.ts`
- Create: `backend/src/users/users.module.ts`
- Create: `backend/src/users/users.service.ts`
- Modify: `backend/src/app.module.ts`
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/<timestamp>_make_user_email_optional/migration.sql`

**Interfaces:**
- Consumes: `VerifiedAuth0Claims` from `@CurrentUser()` and `PrismaService`.
- Produces: `GET /me` response `{ id: string; email: string | null; name: string | null }`.

- [ ] **Step 1: Allow Auth0 users without an email access-token claim**

Change the `User` model field from `email String @unique` to `email String? @unique`, then create and apply a migration:

```bash
cd backend
bunx prisma migrate dev --name make_user_email_optional
```

This keeps the database model aligned with real Auth0 access tokens, which do not guarantee an `email` claim.

- [ ] **Step 2: Implement user upsert**

Create `UsersService.findOrCreateCurrentUser(claims: VerifiedAuth0Claims)`:

```ts
return this.prisma.user.upsert({
  where: { id: claims.sub },
  update: { email: claims.email ?? null, name: claims.name ?? null },
  create: { id: claims.sub, email: claims.email ?? null, name: claims.name ?? null },
});
```

The user identifier always remains the verified `sub`; `email` and `name` are optional profile data.

- [ ] **Step 3: Implement `GET /me`**

Create a controller with `@UseGuards(AuthGuard)` and:

```ts
@Get('me')
me(@CurrentUser() claims: VerifiedAuth0Claims) {
  return this.usersService.findOrCreateCurrentUser(claims);
}
```

- [ ] **Step 4: Wire the module**

Import `AuthModule` and `UsersModule` in `AppModule`. Leave `AppController.health()` unchanged and unguarded.

- [ ] **Step 5: Commit**

```bash
git add backend/src/users backend/src/app.module.ts
git commit -m "✨ feat: add authenticated current user API"
```

### Task 5: Verify and update delivery status

**Files:**
- Modify: `TASKS.md`

**Interfaces:**
- Consumes: built backend and running Docker MySQL service.
- Produces: a verified Auth0 API branch ready for review.

- [ ] **Step 1: Run static verification**

```bash
bun run typecheck
bun run build
```

Expected: both commands exit with code 0.

- [ ] **Step 2: Verify health remains public**

```bash
curl --fail http://localhost:3001/healthz
```

Expected: `{ "status": "ok" }` without an Authorization header.

- [ ] **Step 3: Verify protected-route configuration**

```bash
curl --include http://localhost:3001/me
```

Expected: HTTP 401 without an Authorization header.

- [ ] **Step 4: Mark completed setup items**

Mark API specification and authentication setup entries complete. Keep all unit, integration, and E2E test entries pending.

- [ ] **Step 5: Commit**

```bash
git add TASKS.md
git commit -m "📝 docs: record Auth0 API verification"
```

# Auth0 API Design

## Goal

Protect the Private Bookmark Manager API with real Auth0 access tokens and provide a trusted `GET /me` endpoint for the authenticated user.

## Scope

- Validate Auth0 RS256 access tokens on protected NestJS routes.
- Expose `GET /me` from validated token claims.
- Keep `GET /healthz` public.
- Document the contract and security decision.
- Defer automated test implementation for this setup phase.

## Configuration

The backend reads these server-only environment variables:

- `AUTH0_ISSUER_URL=https://dev-yg.us.auth0.com/`
- `AUTH0_AUDIENCE=https://bbl-candidate-test-api`

The issuer URL determines the discovery document and JWKS source. The audience ensures that only access tokens intended for this API are accepted. No Auth0 client secret is required by the backend resource server.

## Request flow

1. The frontend completes Authorization Code Flow with PKCE and requests an access token for `AUTH0_AUDIENCE`.
2. The frontend sends `Authorization: Bearer <access-token>` to a protected API route.
3. The NestJS guard loads Auth0 discovery metadata and JWKS, then verifies the token signature using RS256.
4. The guard rejects missing, expired, malformed, wrong-issuer, wrong-audience, or unsigned tokens with HTTP 401.
5. The guard exposes verified claims to route handlers.
6. `GET /me` returns `id` from `sub`, plus `email` and `name` when they are present in the verified claims.

## API contract

### `GET /healthz`

Authentication: none.

Response `200`:

```json
{ "status": "ok" }
```

### `GET /me`

Authentication: required access token.

Response `200`:

```json
{
  "id": "auth0|subject",
  "email": "user@example.com",
  "name": "User"
}
```

`id` always comes from the verified `sub` claim. `email` and `name` are nullable because Auth0 access-token claims can vary by configuration.

Response `401`:

```json
{ "statusCode": 401, "message": "Unauthorized" }
```

## Backend boundaries

- `auth/auth0-jwt.service.ts` verifies tokens and returns a narrow verified-claims type.
- `auth/auth.guard.ts` extracts the Bearer token, delegates verification, and attaches claims to the request.
- `auth/current-user.decorator.ts` retrieves verified claims from a guarded request.
- `users/users.controller.ts` provides `GET /me`.
- Future collections and bookmarks modules must derive `ownerId` from the verified `sub` claim and never accept it from request input.

## Security rules

- Accept access tokens only; reject ID tokens that do not satisfy the API audience.
- Allow only the RS256 algorithm.
- Use the Auth0 JWKS endpoint discovered from the configured issuer; never trust a decoded but unverified token.
- Do not log access tokens or put server configuration into browser environment variables.
- Return 404, not 403, for an authenticated user attempting to access another user's private resource.

## Verification for this phase

- Run `bun run typecheck` and `bun run build`.
- Manually validate `/healthz` remains public after the guard is added.
- Automated unit, integration, and E2E tests remain deferred until test automation resumes.

# API Design

## Authentication

All API endpoints except `GET /healthz` require `Authorization: Bearer <access-token>`.

The API accepts an Auth0 **access token**, not an ID token. Access tokens are issued for API authorization and can be validated against the API audience; ID tokens are for the client application's identity session.

The validator must require:

- issuer `https://dev-yg.us.auth0.com/`
- audience `https://bbl-candidate-test-api`
- RS256 signature verified using Auth0 JWKS
- unexpired token with a non-empty `sub` claim

Requests missing or failing validation return `401` with `{ "statusCode": 401, "message": "Unauthorized" }`.

## Current user

`GET /me` upserts the validated subject and returns the current user:

```json
{ "id": "auth0|subject", "email": "user@example.com", "name": "User" }
```

`id` is derived only from the verified token `sub`; client input never supplies an owner ID. `email` and `name` are `null` when the verified access token does not include those claims.

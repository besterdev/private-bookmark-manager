# Axios Transport Migration Design

## Context

The frontend currently hides `fetch` behind `createApiClient`, which exposes custom `get`, `post`, and `delete` methods. The requested change is to replace the internal transport with Axios while preserving that public client interface, the backend contract, and Auth0 security rules.

## Goals

- Use Axios as the internal HTTP transport.
- Attach the current Auth0 access token to every API request.
- Preserve the existing `createApiClient` consumer interface.
- Preserve the existing `ApiError` contract for predictable status handling.
- Keep backend error details out of user-facing messages.
- Cover the migration with focused automated tests.

## Non-goals

- No backend or API contract changes.
- No custom token refresh or retry mechanism; Auth0 remains responsible for token acquisition and refresh.
- No global Axios singleton.
- No direct Axios usage in routes or `AuthGate`.
- No service layer or generated API client.
- No changes to loading, empty, form, or navigation behavior.

## Architecture

`createApiClient` remains the authenticated HTTP boundary. Each call creates a private Axios instance configured for the supplied token getter and API base URL.

The instance will use:

- `baseURL` from `VITE_API_BASE_URL`.
- A request interceptor that awaits `getAccessTokenSilently()` and sets `Authorization: Bearer <access-token>`.
- A response interceptor that preserves successful Axios responses and converts Axios failures into `ApiError`.

A client instance remains scoped to its current consumer rather than exported as a global singleton. This avoids mutable global token state, cross-test leakage, and duplicate interceptor registration.

## Consumer API

Routes and `AuthGate` keep the existing transport-agnostic interface:

```ts
const api = createApiClient(() => getAccessTokenSilently())
const collections = await api.get<Collection[]>('/collections')
setCollections(collections)
```

The client unwraps `AxiosResponse.data` before returning. POST requests pass plain objects through Axios, which serializes JSON and sets the appropriate content type. DELETE resolves to `void` for Axios's normal `204 No Content` response.

## Error handling

`ApiError` remains the application-level transport error and includes the HTTP status. The response interceptor will extract a string `message` only when the response body has the documented NestJS error shape; otherwise it will use `Request failed (<status>)` or `Network request failed`.

`ApiError` may contain the documented backend message for programmatic handling, but route components must render fixed safe messages such as `Unable to load bookmarks` or `Unable to save collection`. Tokens, headers, and Axios request configuration must never be logged or exposed.

Auth0 token acquisition failures will reject naturally and remain protected from rendering by the same fixed route-level messages.

## Testing

Tests will be written before production changes and will prove:

- The Axios adapter receives the configured base URL and Auth0 Bearer token.
- Existing GET and POST methods return typed response data without exposing `AxiosResponse`.
- DELETE handles `204 No Content`.
- HTTP failures become `ApiError` with the expected status.
- Network failures receive a safe fallback error.
- Existing route and authentication tests continue to pass without Axios-specific changes.

The migration is complete when frontend tests, lint, typecheck, and production build pass on the supported Node.js runtime.

## Senior review criteria

The final review will check:

- interceptor lifecycle and stale Auth0 closures;
- token and error-detail exposure;
- Axios typing and response unwrapping accuracy;
- duplicated request or error handling;
- behavior regressions in routes and authentication;
- unnecessary abstractions or scope creep.

# Axios Frontend Client Design

## Context

The frontend currently hides `fetch` behind `createApiClient`, which exposes custom `get`, `post`, and `delete` methods. The requested change is to adopt Axios directly across authenticated frontend consumers while preserving the existing backend contract and Auth0 security rules.

## Goals

- Use a real `AxiosInstance` in authenticated frontend routes and `AuthGate`.
- Attach the current Auth0 access token to every API request.
- Preserve the existing `ApiError` contract for predictable status handling.
- Keep backend error details out of user-facing messages.
- Cover the migration with focused automated tests.

## Non-goals

- No backend or API contract changes.
- No custom token refresh or retry mechanism; Auth0 remains responsible for token acquisition and refresh.
- No global Axios singleton.
- No service layer or generated API client.
- No changes to loading, empty, form, or navigation behavior.

## Architecture

`useApiClient` will be the authenticated HTTP boundary. The hook will read `getAccessTokenSilently` from Auth0 and create one memoized Axios instance for the current token getter and API base URL.

The instance will use:

- `baseURL` from `VITE_API_BASE_URL`.
- A request interceptor that awaits `getAccessTokenSilently()` and sets `Authorization: Bearer <access-token>`.
- A response interceptor that preserves successful Axios responses and converts Axios failures into `ApiError`.

A client is scoped to the React authentication context rather than exported as a global singleton. This avoids mutable global token state, cross-test leakage, and duplicate interceptor registration.

## Consumer API

Routes and `AuthGate` will consume the Axios instance directly:

```ts
const api = useApiClient()
const response = await api.get<Collection[]>('/collections')
setCollections(response.data)
```

POST requests pass plain objects through Axios, which serializes JSON and sets the appropriate content type. DELETE requests accept Axios's normal `204 No Content` response without a custom response-body branch.

## Error handling

`ApiError` remains the application-level transport error and includes the HTTP status. The response interceptor will extract a string `message` only when the response body has the documented NestJS error shape; otherwise it will use `Request failed (<status>)` or `Network request failed`.

Transport errors may contain backend details for diagnostics inside program logic, but route components must render fixed safe messages such as `Unable to load bookmarks` or `Unable to save collection`. Tokens, headers, and Axios request configuration must never be logged or exposed.

Auth0 token acquisition failures will reject naturally and remain protected from rendering by the same fixed route-level messages.

## Testing

Tests will be written before production changes and will prove:

- The Axios adapter receives the configured base URL and Auth0 Bearer token.
- GET and POST consumers receive typed data through `AxiosResponse.data`.
- DELETE handles `204 No Content`.
- HTTP failures become `ApiError` with the expected status.
- Network failures receive a safe fallback error.
- Existing route and authentication tests pass after moving to `useApiClient`.

The migration is complete when frontend tests, lint, typecheck, and production build pass on the supported Node.js runtime.

## Senior review criteria

The final review will check:

- interceptor lifecycle and stale Auth0 closures;
- token and error-detail exposure;
- Axios typing accuracy;
- duplicated request or error handling;
- behavior regressions in routes and authentication;
- unnecessary abstractions or scope creep.

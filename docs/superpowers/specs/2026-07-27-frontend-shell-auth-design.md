# Frontend Shell and Auth0 Design

## Goal

Provide the protected React application foundation for Private Bookmark Manager: real Auth0 Authorization Code + PKCE login, token-aware API access, and a reusable MUI navigation shell.

## Architecture

`Auth0Provider` wraps the application at the entry point and receives configuration only from `VITE_AUTH0_*` variables. A small auth boundary handles loading, error, login, logout, and protected-route behavior. A separate API client obtains an Auth0 access token only at call time and adds it as a Bearer credential; no token is persisted manually.

## UI

- Persistent desktop sidebar with Collections and Bookmarks navigation.
- Compact mobile top bar with a menu trigger.
- Shared app bar displays the authenticated user's name/email and logout control.
- Theme continues the approved Smalt blue `#003399`, Blaze Orange `#FF6E00`, and Mine Shaft `#3F3F3F` design system.

## Route behavior

- `/` redirects to `/collections`.
- `/collections` and `/bookmarks` are protected route placeholders for the following feature branches.
- `/callback` completes the Auth0 redirect and returns the user to the requested route.
- Unauthenticated visitors see a minimal sign-in screen; protected routes trigger login with `appState.returnTo`.

## API boundary

`createApiClient(getAccessTokenSilently)` exposes `get(path)` and sends `Authorization: Bearer <access token>`. The client uses `VITE_API_BASE_URL` and throws a typed error for non-2xx responses. It will be consumed by the Collections and Bookmarks UI branches.

## Configuration and security

- Use `@auth0/auth0-react`, which performs Authorization Code + PKCE in the SPA.
- Request audience `https://bbl-candidate-test-api`; backend validates this access token.
- Required public variables: `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`, `VITE_API_BASE_URL`.
- Never put secrets, a client secret, a database URL, or a service role credential in `VITE_*` variables.

## Test scope

- Unit test public app heading and unauthenticated sign-in state using a mocked Auth0 hook.
- Typecheck and production build the frontend.

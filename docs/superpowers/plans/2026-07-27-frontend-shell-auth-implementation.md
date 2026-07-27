# Frontend Shell and Auth0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real Auth0 PKCE boundary, protected router, MUI navigation shell, and authenticated API client.

**Architecture:** `Auth0Provider` is configured from public Vite variables at startup. `AuthGate` controls loading, errors, login, and callback redirects; the app shell is only rendered after authentication. The API client receives Auth0's token getter as a dependency and does not store tokens.

**Tech Stack:** React 19, Vite 8, TypeScript, React Router 8, MUI 9, `@auth0/auth0-react`, Vitest.

## Global Constraints

- Use Auth0 Authorization Code + PKCE via `@auth0/auth0-react`.
- Use access tokens for audience `https://bbl-candidate-test-api`.
- Keep all configuration in `VITE_AUTH0_*` variables; never add client secrets.
- Preserve the approved Smalt, Blaze Orange, and Mine Shaft colors.

---

### Task 1: Add Auth0 dependency and public configuration

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/.env.example`
- Create: `frontend/src/config/auth0.ts`

- [ ] Install `@auth0/auth0-react` with Bun.
- [ ] Add `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, and `VITE_AUTH0_AUDIENCE` placeholders to the frontend example environment file.
- [ ] Implement `auth0Config` which reads the variables and throws a clear startup error if domain or client ID is missing.
- [ ] Commit:

```bash
git add frontend/package.json bun.lock frontend/.env.example frontend/src/config/auth0.ts
git commit -m "🔧 chore: configure Auth0 SPA client"
```

### Task 2: Build the authentication boundary with tests

**Files:**
- Create: `frontend/src/auth/AuthGate.tsx`
- Create: `frontend/src/auth/AuthGate.test.tsx`
- Modify: `frontend/src/main.tsx`

- [ ] Write failing tests for a visible sign-in action when unauthenticated and a loading state while Auth0 initializes.
- [ ] Implement `AuthGate` with `useAuth0()`: show loading, show an error alert, call `loginWithRedirect({ appState: { returnTo } })`, and render children only when authenticated.
- [ ] Wrap the root in `Auth0Provider`, passing redirect URI `${window.location.origin}/callback`, audience, and `onRedirectCallback` that navigates to `appState.returnTo ?? '/collections'`.
- [ ] Run `bun run test` and `bun run typecheck`.
- [ ] Commit:

```bash
git add frontend/src/auth frontend/src/main.tsx
git commit -m "✨ feat: add Auth0 protected app boundary"
```

### Task 3: Add routes and responsive MUI shell

**Files:**
- Create: `frontend/src/layout/AppShell.tsx`
- Create: `frontend/src/routes/CollectionsPage.tsx`
- Create: `frontend/src/routes/BookmarksPage.tsx`
- Create: `frontend/src/routes/CallbackPage.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.test.tsx`

- [ ] Write failing app test proving the product heading and the Collections/Bookmarks navigation are visible through the authenticated test boundary.
- [ ] Implement browser routes: `/` redirect, `/collections`, `/bookmarks`, `/callback`.
- [ ] Implement MUI desktop sidebar and mobile drawer, active `NavLink`s, user menu, and Auth0 logout returning to `window.location.origin`.
- [ ] Keep Collections/Bookmarks as explicit placeholders for their following feature branches.
- [ ] Run frontend test, typecheck, and build.
- [ ] Commit:

```bash
git add frontend/src/App.tsx frontend/src/App.test.tsx frontend/src/layout frontend/src/routes
git commit -m "✨ feat: add private bookmark app shell"
```

### Task 4: Add token-aware API client and delivery checklist

**Files:**
- Create: `frontend/src/lib/api-client.ts`
- Modify: `TASKS.md`
- Test: `frontend/src/lib/api-client.test.ts`

- [ ] Write a failing test that verifies `get('/me')` requests `${VITE_API_BASE_URL}/me` with a Bearer access token and rejects non-2xx responses.
- [ ] Implement `createApiClient(getAccessTokenSilently)` with `get<T>(path)` and a typed `ApiError`.
- [ ] Mark React Router/MUI, Auth0 login/callback/logout/protected routes, authenticated API client, and shared loading/error state as complete.
- [ ] Run frontend test, typecheck, and build.
- [ ] Commit:

```bash
git add frontend/src/lib frontend/src/lib/api-client.test.ts TASKS.md
git commit -m "✨ feat: add authenticated API client"
```

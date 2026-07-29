# Private Bookmark Manager

A full-stack private bookmark manager. Each authenticated user can organize bookmarks into collections while the API enforces strict per-user ownership isolation.

## Architecture

- **Frontend:** React, Vite, TypeScript, MUI
- **Backend:** NestJS, TypeScript, Prisma
- **Authentication:** Auth0 Authorization Code Flow with PKCE; the API validates Auth0 access tokens with JWKS
- **Database:** MySQL 8.4
- **Package manager:** Bun

The frontend calls documented HTTP endpoints only. The backend derives ownership from the verified access-token subject and scopes every collection and bookmark query to that owner.

## Prerequisites

- Node.js `>=22.12.0 <23`
- Bun
- Docker Desktop for the Docker workflow
- An Auth0 SPA application and API

## Configuration

Copy the template and set only your local values:

```bash
cp .env.example .env
```

Required variable names:

- `VITE_API_BASE_URL`
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`
- `AUTH0_ISSUER_URL`
- `AUTH0_AUDIENCE`
- `CORS_ORIGIN`
- `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`
- `DATABASE_URL`

In Auth0, configure the SPA callback, logout, and web-origin URLs for the local frontend. Configure the SPA to request the API audience. Do not commit `.env` or Auth0 secrets.

## Run with Docker

```bash
docker compose up --build
```

The frontend is served on `http://localhost:3000`, the backend on `http://localhost:3001`, and MySQL on `localhost:3306`.

## Run locally

```bash
bun install
bun run dev
```

Run individual applications when needed:

```bash
bun --cwd backend run start:dev
bun --cwd frontend run dev
```

Apply or seed the local database with Prisma commands from `backend/` after configuring `DATABASE_URL`.

## Quality commands

```bash
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

The E2E suite uses deterministic local test users and mocked authentication boundaries; it does not call live Auth0.

## Features

- Auth0 sign-in, callback handling, logout, and API access verification via `GET /me`
- Private collection CRUD
- Private bookmark CRUD, card-grid presentation, and collection filtering
- `GET /collections/:id/bookmarks`
- Loading, empty, validation, error, and retry states
- Dockerized MySQL, frontend, and backend

## Privacy and API behavior

- API access requires an Auth0 **access token**, not an ID token.
- The backend validates token issuer, audience, RS256 signature, expiry, and JWKS.
- `ownerId` is derived from the verified token and is never supplied by the client.
- Missing and foreign collections/bookmarks both return `404` so ownership cannot be inferred.
- Deleting a collection keeps its bookmarks and sets their `collectionId` to `null`.

See [API_DESIGN.md](API_DESIGN.md) and [DECISIONS.md](DECISIONS.md) for the detailed contract and decisions.

## Intentional exclusions

- Collection sharing is not implemented; all resources are private to their authenticated owner.
- CI, full-text bookmark search, and an aggregate `/all` UI are not included in this submission.

## Evidence

See [docs/submission-evidence.md](docs/submission-evidence.md) for requirement-to-source-and-test traceability and [AI_WORKFLOW.md](AI_WORKFLOW.md) for the AI-assisted development workflow.

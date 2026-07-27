# Private Bookmark Manager - Task Checklist

Legend: `[x]` complete, `[ ]` not started, `[-]` in progress or needs verification.

## Delivery branches

- [x] Commit documentation baseline to `main`
- [x] `chore/project-setup` - combined frontend and backend workspace scaffold in `.worktrees/project-setup`
- [x] `feat/api-spec-and-auth` - Auth0 API guard and current-user endpoint
- [-] `feat/database-prisma` - Docker, Prisma schema, migration, and seed verification
- [x] `feat/backend-collections`
- [ ] `feat/backend-bookmarks`
- [ ] `feat/frontend-shell-and-auth`
- [ ] `feat/frontend-collections`
- [ ] `feat/frontend-bookmarks`
- [ ] `test/authorization-integration`
- [ ] `test/private-bookmark-e2e`
- [ ] `docs/submission-evidence`

## Project setup

- [x] Create `AGENTS.md` with project rules, target structure, commands, and workflow
- [x] Initialize root Bun workspace (defer `bun install` and `bun.lock` until frontend and backend exist)
- [x] Create NestJS backend in `backend/`
- [x] Create Vite React frontend in `frontend/`
- [x] Add root scripts for dev, lint, typecheck, test, E2E test, and build
- [x] Create `.env.example` files without secrets
- [ ] Add `.agent/` reusable agent capability

## API specification and decisions

- [x] Inspect Auth0 discovery document and JWKS
- [x] Decide which Bearer token the API accepts and document the security rationale
- [x] Create `API_DESIGN.md`
- [x] Define `/me` API contract
- [x] Define Collections CRUD API contract
- [ ] Define Bookmarks CRUD and filtering API contract
- [ ] Define `GET /collections/:id/bookmarks` contract
- [ ] Define common error response and HTTP status-code standards
- [x] Define resource ownership and 404 behaviour for inaccessible resources
- [x] Create `DECISIONS.md`
- [x] Decide collection deletion behaviour
- [ ] Decide whether and how collection sharing is supported

## Backend - authentication and data

- [ ] Configure Auth0 OIDC Authorization Code Flow with PKCE (S256)
- [x] Implement JWT validation using issuer, audience, signature, expiry, algorithm, and JWKS
- [x] Add authentication guard to protected API routes
- [x] Create Prisma schema for users, collections, and bookmarks
- [x] Create database migration
- [x] Add seed data for at least two users
- [x] Implement `GET /me`

## Backend - collections

- [x] Implement collection create endpoint
- [x] Implement collection list endpoint
- [x] Implement collection detail endpoint
- [x] Implement collection PUT endpoint
- [x] Implement collection PATCH endpoint
- [x] Implement collection delete endpoint
- [x] Enforce owner-scoped collection queries and mutations

## Backend - bookmarks

- [ ] Implement bookmark create endpoint
- [ ] Implement bookmark list endpoint
- [ ] Implement bookmark detail endpoint
- [ ] Implement bookmark PUT endpoint
- [ ] Implement bookmark PATCH endpoint
- [ ] Implement bookmark delete endpoint
- [ ] Implement bookmark filtering by collection
- [ ] Implement `GET /collections/:id/bookmarks`
- [ ] Enforce owner-scoped bookmark queries and mutations

## Frontend - authentication and shared UI

- [ ] Configure React Router and MUI
- [ ] Implement Auth0 login flow
- [ ] Implement callback handling
- [ ] Implement logout flow
- [ ] Implement protected routes
- [ ] Create authenticated API client
- [ ] Add shared loading, empty, validation, and error states

## Frontend - collections

- [ ] Build collections list page
- [ ] Build collection detail view
- [ ] Build collection create flow
- [ ] Build collection delete flow
- [ ] Show bookmarks belonging to a selected collection

## Frontend - bookmarks

- [ ] Build bookmarks list page
- [ ] Build bookmark detail view
- [ ] Build bookmark create flow
- [ ] Build bookmark delete flow
- [ ] Build filter-by-collection control

## Unit and integration tests

- [ ] Test JWT validation and authentication guard
- [ ] Test request validation and common errors
- [x] Test collection service CRUD logic
- [ ] Test bookmark service CRUD and filter logic
- [x] Test collection deletion behaviour
- [x] Test owner-scoped collection access
- [ ] Test owner-scoped bookmark access
- [ ] Test frontend forms and API state handling

## End-to-end tests

- [x] Verify an unauthenticated user cannot use protected routes
- [x] Verify authenticated collection CRUD flow
- [ ] Verify authenticated bookmark CRUD and filtering flow
- [x] Verify User A cannot list, read, update, or delete User B's collection
- [ ] Verify User A cannot list, read, update, or delete User B's bookmark
- [ ] Verify User A cannot access User B's collection bookmarks endpoint

## Submission and delivery

- [ ] Create `AI_WORKFLOW.md`
- [ ] Save real prompt and agent session logs in `transcripts/` with secrets redacted
- [ ] Create `README.md` with setup, run, and test instructions
- [ ] Document completed and skipped work in README
- [ ] Verify API documentation matches implementation and tests
- [ ] Run lint, typecheck, unit/integration tests, E2E tests, and production builds
- [ ] Review commit history for meaningful incremental commits

## Optional bonuses

- [x] Add Docker configuration
- [ ] Add CI pipeline
- [ ] Add `/all` page for collections with embedded bookmarks
- [ ] Add full-text search for bookmark titles and notes

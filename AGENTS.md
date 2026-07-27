# AGENTS.md

## Project overview

Private Bookmark Manager is a full-stack application where each authenticated user can save private bookmarks and organise them into collections.

The core security invariant is strict ownership isolation: a user must never be able to list, read, create against, update, delete, or infer the existence of another user's collections or bookmarks.

Primary user flows:

- Authenticate with Auth0 using Authorization Code Flow with PKCE (S256).
- View the current signed-in user through `GET /me`.
- Create, list, view, update, and delete private collections.
- Create, list, view, update, and delete private bookmarks.
- Filter bookmarks by collection and view bookmarks in a collection.

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, TypeScript, React Router v8+, MUI v9+ |
| Backend | Node.js, TypeScript, NestJS |
| Authentication | Auth0 OIDC, Authorization Code + PKCE (S256), JWT validation via JWKS |
| Database | SQL database managed with Prisma ORM |
| Tests | Jest for unit/integration tests; Playwright for browser E2E tests |
| Package manager | Bun |

Never expose secrets, tokens, or database credentials in source code, client-side environment variables, commits, documentation, or transcripts.

Use Bun for dependency management, scripts, workspaces, and the lockfile. Commit `bun.lock` and use `bun ci` in CI. Use Node.js 22.12+ (below 23) as the runtime for the frontend, NestJS backend, Jest, and Playwright unless compatibility has been verified for Bun runtime.

## Folder structure

```text
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── auth/
│   │   ├── collections/
│   │   ├── bookmarks/
│   │   ├── users/
│   │   ├── common/
│   │   └── main.ts
│   └── test/
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── collections/
│   │   │   └── bookmarks/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── routes/
│   │   └── test/
│   └── e2e/
├── transcripts/
├── .agent/
├── AGENTS.md
├── API_DESIGN.md
├── DECISIONS.md
├── AI_WORKFLOW.md
└── README.md
```

Keep frontend and backend boundaries explicit. The frontend must only call documented HTTP endpoints; it must not access the database or Prisma directly.

## Coding rules

### General

- Use TypeScript strict mode. Avoid `any`; use explicit types, DTOs, and narrow unknown values safely.
- Prefer small, single-purpose modules. Do not add abstractions without a current use case.
- Use conventional, descriptive English names for files, functions, API fields, and test cases.
- Validate all external input at the boundary. Return a consistent documented error shape.
- Keep `.env.example` complete with placeholder values only. Never commit real credentials.

### Backend

- Protect every application endpoint with authentication except explicitly documented health endpoints.
- Verify JWT issuer, audience, signature, expiry, and algorithm using the Auth0 discovery document and JWKS. Do not merely decode a token.
- Derive the authenticated owner ID from the validated token; never accept `ownerId` from request body, query parameters, or URL parameters.
- Apply owner scoping in every Prisma read and mutation. For example, look up resources with both `id` and `ownerId`.
- Return `404` for resources outside the authenticated user's ownership to avoid exposing their existence.
- Use DTO validation for create, replace, patch, and filter requests.
- Define collection deletion behaviour explicitly in `API_DESIGN.md` and enforce it through Prisma relation configuration and tests.

### Frontend

- Keep routes thin; place feature logic in `src/features/<feature>`.
- Use MUI components and accessible labels. Buttons and form controls must have clear names.
- Treat the API as untrusted: display safe error messages and handle loading, empty, success, and failure states.
- Do not store long-lived secrets in the browser. Use the selected Auth0 SDK flow and avoid logging tokens.

### Tests

- Write or update tests with every behaviour change.
- Prioritise tests for authorization, owner isolation, validation, filters, and collection deletion behaviour.
- Include at least two users in test/seed data. Happy-path-only tests are insufficient.
- E2E tests must prove that User A cannot access User B's collection or bookmark by direct ID or list/filter endpoints.
- Do not claim a security property in documentation unless a runnable test or precise implementation reference supports it.

## Commands

Run commands from the repository root unless stated otherwise.

```bash
# Install dependencies after the workspace is scaffolded
bun install

# Run both applications (define these scripts in the root package.json)
bun run dev

# Run applications independently
bun --cwd backend run start:dev
bun --cwd frontend run dev

# Database workflow
bun --cwd backend x prisma migrate dev
bun --cwd backend x prisma db seed

# Quality checks
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build

# CI installation
bun ci
```

Before considering a change complete, run the narrowest relevant test first, then run lint, typecheck, the appropriate test suite, and build when the relevant scripts exist.

## Workflow

1. Read `API_DESIGN.md`, `DECISIONS.md`, and this file before changing code.
2. Turn the requested behaviour into a small, testable specification. Record any ambiguous product or security decision in `DECISIONS.md` before implementation.
3. Inspect the existing code and tests. Do not overwrite unrelated user changes.
4. Implement backend contract and authorization rules before dependent frontend changes.
5. Add or update unit/integration tests, including an owner-isolation case where relevant.
6. Implement frontend behaviour against the documented API contract.
7. Run the required verification commands and report exactly what passed, failed, or was not run.
8. Update `API_DESIGN.md`, `README.md`, and any decision records affected by the change.
9. Keep commits focused and meaningful: scaffold, feature, tests, and fixes should be separate when practical.
10. Preserve real agent prompts, plans, reviews, and recoveries in `transcripts/`; redact secrets only.

## Commit messages

Use Gitmoji at the start of every commit subject in the format:

```text
<emoji> <type>: <concise imperative summary>
```

Use the emoji that accurately describes the primary change. Common choices:

- `🎉 chore:` begin project setup
- `✨ feat:` add a user-facing feature
- `💄 style:` add or update UI and styles
- `📝 docs:` add or update documentation
- `✅ test:` add, update, or repair tests
- `🐛 fix:` fix a bug
- `🔒 fix:` fix a security or privacy issue
- `🗃️ feat:` make database-related changes
- `🔧 chore:` update configuration
- `👷 ci:` add or update CI
- `🔀 merge:` merge a verified feature branch

Do not use an emoji as decoration; select it according to the Gitmoji definition. Do not mix unrelated changes in one commit.

## Definition of done

A change is done only when it:

- Meets the documented API and UI behaviour.
- Preserves strict per-user privacy.
- Has relevant automated test coverage.
- Passes applicable lint, typecheck, test, and build checks.
- Has matching documentation and no secret exposure.

# Reusable Agent Playbooks Design

## Goal

Add repository-local reusable playbooks that help future contributors and AI
agents make safe, consistent changes to the Private Bookmark Manager.

## Scope

Create a `.agent/` directory with one README and three Markdown playbooks:

| File | Role |
| --- | --- |
| `.agent/README.md` | Explains the available playbooks and how to select one. |
| `.agent/backend-api-security.md` | Guides backend API, authentication, ownership, database, and integration-test changes. |
| `.agent/frontend-ui-tests.md` | Guides React/MUI UI, API-consumer, route, and frontend-test changes. |
| `.agent/quality-review.md` | Guides pre-merge review and verification across the whole workspace. |

The playbooks are repository documentation. They do not introduce a runtime,
dependency, CI integration, external service, or automatic code generation.

## Shared requirements

Every playbook must direct the user to read `AGENTS.md`, `API_DESIGN.md`, and
`DECISIONS.md` before making a change. It must restate the relevant non-
negotiable constraints: use Bun, keep TypeScript strict, never expose secrets,
and preserve the documented feature-branch workflow.

## Role responsibilities

### Backend API and security

The backend playbook owns NestJS controllers/services/DTOs, Prisma queries and
schema changes, Auth0 access-token validation, API documentation, and Jest or
Supertest coverage. It requires authenticated identity to come only from the
validated token `sub`; all data reads and mutations must include owner scope;
foreign resources must behave as `404`. It includes a checklist for DTO
validation, collection relationship behaviour, and two-user authorization
tests.

### Frontend UI and tests

The frontend playbook owns React routes and features, MUI components,
documented HTTP API consumption, loading/error/empty states, accessibility,
and Vitest coverage. It requires thin routes, feature-local logic, safe API
errors, no browser token logging, and responsive use of the existing design
system. It explicitly keeps Prisma and database access on the backend.

### Quality review

The review playbook is read-only until an approved finding is fixed. It
reviews the diff against `main`, prioritises privacy/security findings, checks
API and documentation alignment, then runs the narrowest relevant test followed
by `bun run lint`, `bun run typecheck`, relevant unit or E2E suites, and
`bun run build`. It records passed, failed, and skipped checks accurately.

## Acceptance criteria

1. `.agent/README.md` routes backend, frontend, and review work to a single
   clear playbook.
2. Each playbook has purpose, scope, mandatory checks, commands, and a concise
   definition of done.
3. Backend guidance explicitly protects Auth0 token validation and per-user
   ownership isolation.
4. Frontend guidance explicitly preserves MUI, accessibility, API boundaries,
   and shared states.
5. Review guidance prioritises actionable findings and reports exact
   verification outcomes.

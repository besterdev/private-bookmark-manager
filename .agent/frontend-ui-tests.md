# Frontend UI and Tests Playbook

## Purpose

Build and verify accessible React and MUI experiences that consume only the documented API and remain coherent with the approved Minimal-inspired design system.

## Use when

Use for React routes, feature modules, MUI components, authenticated API consumers, forms, responsive navigation, shared states, and Vitest coverage.

## Read first

Read `AGENTS.md`, `API_DESIGN.md`, `DECISIONS.md`, and `AI_WORKFLOW.md`, then the approved frontend design specification and affected tests.

## Guardrails

- Use Bun and strict TypeScript; never expose secrets or log Auth0 access tokens in the browser.
- Keep routes thin and feature logic in `frontend/src/features/<feature>`; call documented HTTP endpoints only. Never access Prisma or the database from the frontend.
- Preserve the approved brand tokens: Smalt blue `#003399`, Blaze orange `#FF6E00`, Mine Shaft `#3F3F3F`, light surfaces, subtle borders, restrained shadows, and generous spacing.
- Load and apply Public Sans through the shared MUI theme. Use existing Minimal-inspired MUI patterns and shared component overrides rather than page-specific visual drift.
- Preserve desktop permanent navigation and the labelled temporary mobile drawer below `md`; mobile route selection closes the drawer and the current route stays identifiable.
- Give controls accessible labels, visible keyboard focus, and real behavior. A displayed action must perform its intended behavior or not render; never ship a no-op control.
- Handle loading, empty, success, validation, and safe error states with the shared state components. Treat API errors as untrusted and avoid displaying sensitive server details.

## Workflow

1. Confirm the API contract and approved design rules before implementation.
2. Keep query and API-request state owned by the relevant route; extract only presentational shared UI where it has a current use.
3. Implement real interactions, including confirmation and safe failure behavior for destructive actions.
4. Add or update Vitest coverage for accessible controls, navigation, submitted actions, and success/failure states.
5. Exercise keyboard flow for menus, drawers, dialogs, and actionable controls.
6. Run focused frontend tests, then lint, typecheck, and build; use the quality-review playbook before merge for UI-impacting changes.

## Commands

```bash
bun --cwd frontend test
bun --cwd frontend lint
bun --cwd frontend typecheck
bun --cwd frontend build
bun run test:e2e
```

Use the narrowest affected Vitest file before the broader commands.

## Definition of done

The UI uses approved tokens and Public Sans, responsive navigation works at desktop and mobile widths, every displayed action is real and accessible, shared states are covered, API boundaries are preserved, and applicable checks have exact reported results.

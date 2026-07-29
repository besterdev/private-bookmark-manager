# Quality Review Playbook

## Purpose

Provide a focused, evidence-based pre-merge review of privacy, API/UI behavior, documentation, and verification outcomes.

## Use when

Use after an implementation is ready for review, before merge, or when a contributor requests a read-only assessment of a diff.

## Read first

Read `AGENTS.md`, `API_DESIGN.md`, `DECISIONS.md`, and `AI_WORKFLOW.md`, then the relevant approved design specification, tests, and diff against `main`.

## Guardrails

- Remain read-only until a finding is approved for repair; do not modify source, tests, configuration, or documentation during review.
- Use Bun and retain strict TypeScript expectations. Never expose secrets, access tokens, or database credentials in review notes.
- Prioritise actionable privacy and security findings before lower-risk UI or maintainability observations.
- Report exact command outcomes as passed, failed, or skipped; do not describe an unrun command as verified.
- Preserve feature-worktree, focused-Gitmoji-commit, and explicit-approval-before-merge workflow.

## Workflow

1. Inspect the diff against `main`, the affected contract, decisions, and tests.
2. Check privacy: validated Auth0 identity, owner-scoped access, `404` privacy behavior, DTO validation, and two-user coverage where backend behavior changed.
3. Check frontend behavior: mobile route access and drawer close/dismiss flow, Public Sans availability, approved tokens, visible focus, keyboard navigation, shared loading/empty/error states, and inactive or no-op controls.
4. Check API and documentation alignment, including collection deletion behavior and exact endpoint/error claims.
5. Run the narrowest relevant test first, then only the non-mutating lint commands below, typecheck, relevant unit or E2E suites, and build.
6. Return findings ordered by severity with file and line evidence, followed by exact passed, failed, and skipped command outcomes.

## Commands

```bash
git diff main...HEAD --check
bun --cwd frontend lint
bun --cwd backend x eslint "{src,apps,libs,test}/**/*.ts"
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

Run only relevant commands after the narrowest affected test, and mark unavailable or inapplicable commands as skipped with a reason.

## Definition of done

The review remains read-only, identifies only actionable findings with evidence, covers privacy and mobile/accessibility risks, checks documentation alignment, and records every verification command outcome exactly.

# Submission Evidence Design

## Goal

Create a concise reviewer-ready documentation pack that explains how to run the application, verifies the private-data security model, and records AI-assisted development without exposing secrets.

## Deliverables

- `README.md`: English reviewer guide with architecture, prerequisites, Auth0 and Docker setup, commands, feature scope, security behavior, test coverage, and known exclusions.
- `AI_WORKFLOW.md`: English description of AI-assisted workflow, human review gates, verification, and secret handling.
- `transcripts/submission-summary.md`: Redacted high-level record of task planning, implementation, testing, review, and merge decisions. It must not contain tokens, passwords, Auth0 client secrets, or database URLs.
- `docs/submission-evidence.md`: Requirement-to-evidence matrix linking feature requirements to source modules, automated tests, and verification commands.

## Documentation Rules

- Use English, concise reviewer-facing phrasing.
- Reference configuration variable names only; never document active values from `.env` or Auth0.
- Distinguish verified results from commands a reviewer must run locally.
- State that E2E test fixtures use deterministic test users and do not call live Auth0.
- State that collection sharing is intentionally not implemented; collections and bookmarks are private to their authenticated owner.

## Evidence Matrix

The evidence matrix covers authentication, ownership isolation, collection and bookmark CRUD, filtering/nested collection endpoints, collection deletion, validation/error handling, frontend states, and test commands.

## Acceptance Criteria

- A reviewer can start the Docker stack or local apps using only the README and example environment files.
- The security invariant is traceable to both source implementation and runnable tests.
- The AI workflow and transcript are transparent but contain no secrets.
- Checklist items for submission evidence, AI workflow, transcript, README, API verification, verification commands, and commit-history review are updated only after their evidence is present.

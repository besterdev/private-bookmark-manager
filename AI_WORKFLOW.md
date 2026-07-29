# AI-Assisted Development Workflow

This project used AI assistance as a collaborative implementation tool. The developer retained responsibility for architecture decisions, approvals, testing, review, and merging.

## Workflow

1. Review requirements and existing project documents.
2. Define a focused design and obtain approval before implementation.
3. Record an implementation plan with source files, tests, and verification commands.
4. Implement in a feature worktree with focused Gitmoji commits.
5. Run focused tests first, then workspace tests, typechecks, builds, and E2E tests where relevant.
6. Review the branch and merge only after explicit approval.

## Controls

- Auth0 tokens, client secrets, database passwords, and real connection strings are never copied into source, documentation, commits, or transcripts.
- The backend ownership model is verified with unit and E2E tests using deterministic test users.
- Documentation claims are linked to implementation or runnable tests in `docs/submission-evidence.md`.
- Failed commands are investigated before code changes are described as verified.

## Recorded evidence

The redacted delivery summary is available at [transcripts/submission-summary.md](transcripts/submission-summary.md). It records the high-level work stages without raw user prompts or sensitive configuration.

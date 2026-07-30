# Task 1: Safe frontend error copy

## Scope

- Replaced caught error details with fixed UI messages in `BookmarksPage`, `CollectionsPage`, `CollectionDetail`, and the `/me` verification path in `AuthGate`.
- Preserved retry behavior for failed loads and API verification.
- Preserved create-dialog behavior after failed bookmark and collection creation.

## TDD evidence

### RED

Command:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/routes/BookmarksPage.test.tsx src/routes/CollectionsPage.test.tsx src/features/collections/CollectionDetail.test.tsx src/auth/AuthGate.test.tsx
```

Result: exit 1; 6 tests failed and 8 passed. Each failure showed the injected sensitive transport detail instead of the required fixed message. The failures covered bookmark loading and creation, collection loading and creation, collection bookmark loading, and `/me` verification.

### GREEN

Same focused command after implementation: exit 0; 4 test files and 14 tests passed.

## Frontend verification

All checks used Node `v22.19.0` via `PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH`.

| Command | Result |
| --- | --- |
| `bun --cwd frontend test src/routes/BookmarksPage.test.tsx src/routes/CollectionsPage.test.tsx src/features/collections/CollectionDetail.test.tsx src/auth/AuthGate.test.tsx` | Passed: 4 files, 14 tests |
| `bun --cwd frontend lint` | Passed with 3 `react-hooks/exhaustive-deps` warnings in `BookmarksPage`, `CollectionsPage`, and `CollectionDetail` |
| `bun --cwd frontend typecheck` | Passed |
| `bun --cwd frontend build` | Passed; Vite reports an over-500 kB bundle warning |
| `git diff --check` | Passed |

## Notes

- Tests inject a synthetic sensitive error string and assert it is not present in the rendered UI.
- No hook refactor or bundle splitting was included in this task.

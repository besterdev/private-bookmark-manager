# Collections API Design

## Goal

Provide authenticated users with private collection CRUD endpoints while preserving strict ownership isolation.

## API contract

All endpoints require a verified Auth0 access token.

| Method | Path | Request body | Success response |
| --- | --- | --- | --- |
| `POST` | `/collections` | `{ "name": "Work" }` | `201` collection |
| `GET` | `/collections` | none | `200` collection array |
| `GET` | `/collections/:id` | none | `200` collection |
| `PUT` | `/collections/:id` | `{ "name": "Work" }` | `200` collection |
| `PATCH` | `/collections/:id` | `{ "name": "Work" }` | `200` collection |
| `DELETE` | `/collections/:id` | none | `204` no content |

A collection response contains `id`, `name`, `createdAt`, and `updatedAt`. The API never returns `ownerId`.

## Input validation

- `name` is required for `POST` and `PUT`.
- `name` is optional for `PATCH`, but when present it must be a trimmed non-empty string.
- The maximum collection name length is 120 characters.
- Invalid bodies return NestJS validation error responses with HTTP 400.

## Ownership and deletion

- The authenticated `sub` is the only source of `ownerId`.
- List queries filter by `ownerId`.
- Detail, update, and delete queries use both `id` and `ownerId`.
- A collection that does not exist or is owned by another user returns HTTP 404.
- Deleting a collection preserves its bookmarks and clears their `collectionId` through the existing Prisma `onDelete: SetNull` relation.

## Test scope

- Unit-test collection service create, list, detail, replace, patch, and delete behavior.
- Verify User A receives 404 when reading, updating, or deleting User B's collection.
- Verify collection deletion retains bookmarks and clears `collectionId`.
- Add HTTP integration coverage for unauthenticated access, invalid collection names, and a CRUD happy path.

## Verification

- Run targeted backend tests, then `bun run test`.
- Run `bun run typecheck` and `bun run build`.
- Review the API contract against the controller implementation.

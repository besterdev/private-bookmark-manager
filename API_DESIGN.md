# API Design

## Authentication

All API endpoints except `GET /healthz` require `Authorization: Bearer <access-token>`.

The API accepts an Auth0 **access token**, not an ID token. Access tokens are issued for API authorization and can be validated against the API audience; ID tokens are for the client application's identity session.

The validator must require:

- issuer `https://dev-koob6nuzlnt01hbd.us.auth0.com/`
- audience `https://bbl-candidate-test-api`
- RS256 signature verified using Auth0 JWKS
- unexpired token with a non-empty `sub` claim

Requests missing or failing validation return `401` with `{ "statusCode": 401, "message": "Unauthorized" }`.

## Current user

`GET /me` upserts the validated subject and returns the current user:

```json
{ "id": "auth0|subject", "email": "user@example.com", "name": "User" }
```

`id` is derived only from the verified token `sub`; client input never supplies an owner ID. `email` and `name` are `null` when the verified access token does not include those claims.

## Collections

All collection endpoints require a valid Bearer access token.

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| `POST` | `/collections` | `{ "name": "Work" }` | `201` collection |
| `GET` | `/collections` | none | `200` collection array |
| `GET` | `/collections/:id` | none | `200` collection |
| `PUT` | `/collections/:id` | `{ "name": "Work" }` | `200` collection |
| `PATCH` | `/collections/:id` | `{ "name": "Work" }` | `200` collection |
| `DELETE` | `/collections/:id` | none | `204` no content |

A collection response contains `id`, `name`, `createdAt`, and `updatedAt`. Invalid names return `400`; missing or unowned collections return `404`. The API does not return `ownerId`.

## Bookmarks

All bookmark endpoints require a valid Bearer access token.

| Method | Path | Body/query | Success |
| --- | --- | --- | --- |
| `POST` | `/bookmarks` | `{ "url", "title", "notes?", "collectionId?" }` | `201` bookmark |
| `GET` | `/bookmarks` | optional `?collectionId=` | `200` bookmark array |
| `GET` | `/bookmarks/:id` | none | `200` bookmark |
| `PUT` | `/bookmarks/:id` | `{ "url", "title", "notes?", "collectionId?" }` | `200` bookmark |
| `PATCH` | `/bookmarks/:id` | one or more mutable fields | `200` bookmark |
| `DELETE` | `/bookmarks/:id` | none | `204` no content |
| `GET` | `/collections/:id/bookmarks` | none | `200` bookmark array |

A bookmark response contains `id`, `url`, `title`, `notes`, `collectionId`, `createdAt`, and `updatedAt`; it never returns `ownerId`. `url` must be valid, `title` is a trimmed non-empty string of at most 255 characters, `notes` is optional (or `null`) and at most 10,000 characters, and `collectionId` is a CUID or `null`.

Bookmark lists always filter by the authenticated user. A supplied `collectionId` and the nested collection route first verify that the collection belongs to the authenticated user; missing or foreign collections and bookmarks return `404`. Create and update reject assignment to another user's collection with `404`, preventing both cross-user writes and existence disclosure.

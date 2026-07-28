# API Error Contract Design

## Goal

Document and verify consistent error behavior for protected bookmark-manager API endpoints without introducing a custom error format.

## Decision

The API uses NestJS's built-in HTTP exception response shape. `ValidationPipe` supplies `400` validation responses and existing `UnauthorizedException` and `NotFoundException` instances supply authentication and ownership-safe resource errors.

```json
{
  "statusCode": 400,
  "message": ["name must be a string"],
  "error": "Bad Request"
}
```

For errors with a single message, `message` is a string:

```json
{
  "statusCode": 404,
  "message": "Collection not found",
  "error": "Not Found"
}
```

## HTTP Status Standards

| Status | Meaning | Examples |
| --- | --- | --- |
| `400 Bad Request` | Request body or query fails DTO validation, or a PATCH body has no mutable properties. | Empty collection name; malformed bookmark URL; empty PATCH body. |
| `401 Unauthorized` | A protected route has no Bearer token, a malformed header, or an invalid access token. | Missing `Authorization` header. |
| `404 Not Found` | The resource does not exist or is owned by another user. | Foreign collection, bookmark, or nested collection-bookmarks route. |
| `409 Conflict` | Reserved for unique-constraint or state conflicts. No current endpoint deliberately returns it. |
| `500 Internal Server Error` | Unexpected server failure. The response must not expose database or token-provider details. |

`404` intentionally covers inaccessible resources so ownership cannot be inferred from status codes or message text.

## Scope

- Add the status matrix and response examples to `API_DESIGN.md`.
- Add HTTP integration tests for `400`, `401`, and ownership-safe `404` responses.
- Keep the existing NestJS exception format; do not add a global custom exception filter.
- Do not change database schema, API success contracts, or Auth0 behavior.

## Verification

- An invalid `POST /collections` body returns `400` with `statusCode`, an array `message`, and `error` set to `Bad Request`.
- A protected endpoint without a Bearer token returns `401` with the standard NestJS response fields.
- A request for another user's collection returns `404` and `Collection not found`.

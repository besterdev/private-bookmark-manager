# Decisions

## ADR-001: Validate Auth0 access tokens

**Decision:** The backend accepts Auth0 access tokens for audience `https://bbl-candidate-test-api` and validates RS256 signatures through the tenant JWKS.

**Rationale:** An access token represents authorization to call an API. An ID token represents a browser client's authenticated identity and is not an API authorization credential.

**Trade-off:** The SPA must request the API audience during Authorization Code + PKCE login; accepting a valid ID token without the API audience is deliberately rejected.

## ADR-002: Preserve bookmarks when deleting a collection

**Decision:** Deleting a collection clears `Bookmark.collectionId` and preserves the bookmark.

**Rationale:** A collection is organization metadata; a user's saved bookmark remains valuable without it.

**Trade-off:** The product must provide an uncategorized bookmarks view.

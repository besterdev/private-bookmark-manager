# Decisions

## ADR-001: Validate Auth0 access tokens

**Decision:** The backend accepts Auth0 access tokens for audience `https://bbl-candidate-test-api` and validates RS256 signatures through the tenant JWKS.

**Rationale:** An access token represents authorization to call an API. An ID token represents a browser client's authenticated identity and is not an API authorization credential.

**Trade-off:** The SPA must request the API audience during Authorization Code + PKCE login; accepting a valid ID token without the API audience is deliberately rejected.

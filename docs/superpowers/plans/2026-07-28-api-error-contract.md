# API Error Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Document NestJS-standard API errors and verify validation, authentication, and ownership-safe resource failures over HTTP.

**Architecture:** Keep the existing global `ValidationPipe` and NestJS exceptions. Extend the existing collections E2E suite, which already boots `AppModule` with the production validation configuration and a deterministic two-user test guard. Add the contract documentation to `API_DESIGN.md`.

**Tech Stack:** NestJS 11, class-validator, Jest, Supertest, Prisma, MySQL.

## Global Constraints

- Keep NestJS's default exception response format; do not add a custom exception filter.
- Do not change success response contracts, Prisma schema, or Auth0 behavior.
- Return `404` for foreign and missing private resources.
- Use the existing test users `auth0|user-a` and `auth0|user-b`.
- Run E2E tests with `DATABASE_URL`, `AUTH0_ISSUER_URL`, and `AUTH0_AUDIENCE` configured.

---

## File Structure

- Modify `API_DESIGN.md`: add shared HTTP status definitions and response examples.
- Modify `backend/test/collections.e2e-spec.ts`: assert the full HTTP error contract at the existing validation, authentication, and foreign-resource coverage points.
- Modify `backend/src/auth/auth.guard.ts` and `backend/src/auth/auth0-jwt.service.ts`: construct explicit unauthorized exceptions so `401` responses include the default NestJS `error` field.
- Modify `TASKS.md`: mark the error contract and request-validation tests complete after verification.

### Task 1: Document the common HTTP error contract

**Files:**
- Modify: `API_DESIGN.md`

**Interfaces:**
- Produces a project-wide contract for error responses with `statusCode`, `message`, and `error` fields.

- [x] **Step 1: Add the status-code matrix after Authentication**

```md
## Error responses

NestJS returns `{ "statusCode", "message", "error" }` for HTTP exceptions. DTO validation returns an array in `message`; explicit exceptions return a string.

| Status | Meaning |
| --- | --- |
| `400` | DTO validation fails or a PATCH body has no mutable fields. |
| `401` | The protected route has no valid Bearer access token. |
| `404` | The resource is missing or is owned by another user. |
| `409` | Reserved for a future conflict; no endpoint currently returns it. |
| `500` | An unexpected failure; implementation details are not exposed. |
```

- [x] **Step 2: Add examples for validation and private-resource errors**

```json
{ "statusCode": 400, "message": ["name should not be empty"], "error": "Bad Request" }
```

```json
{ "statusCode": 404, "message": "Collection not found", "error": "Not Found" }
```

- [x] **Step 3: Commit the documentation**

```bash
git add API_DESIGN.md
git commit -m "📝 docs: document API error responses"
```

### Task 2: Assert the error contract through Collections E2E tests

**Files:**
- Modify: `backend/test/collections.e2e-spec.ts`
- Modify: `backend/src/auth/auth.guard.ts`
- Modify: `backend/src/auth/auth0-jwt.service.ts`

**Interfaces:**
- Consumes the existing global `ValidationPipe`, `TestAuthGuard`, and `CollectionsController`.
- Produces HTTP-level regression coverage for `400`, `401`, and `404` response bodies, including a consistent `error` field.

- [x] **Step 1: Expand the validation test with failing response-body assertions**

```ts
const invalidResponse = await request(app.getHttpServer())
  .post('/collections')
  .set('Authorization', 'Bearer test-user-a')
  .send({ name: '   ' })
  .expect(400)

expect(invalidResponse.body).toMatchObject({
  statusCode: 400,
  error: 'Bad Request',
})
expect(invalidResponse.body.message).toEqual(
  expect.arrayContaining([expect.stringMatching(/should not be empty/)]),
)
```

- [x] **Step 2: Expand the authentication test with failing response-body assertions**

```ts
const response = await request(app.getHttpServer()).get('/collections').expect(401)

expect(response.body).toEqual({
  statusCode: 401,
  message: 'Unauthorized',
  error: 'Unauthorized',
})
```

- [x] **Step 3: Expand the foreign-resource test with failing response-body assertions**

```ts
const response = await request(app.getHttpServer())
  .get(`/collections/${foreignCollection.id}`)
  .set('Authorization', 'Bearer test-user-a')
  .expect(404)

expect(response.body).toEqual({
  statusCode: 404,
  message: 'Collection not found',
  error: 'Not Found',
})
```

- [x] **Step 4: Run the E2E test to verify the 401 contract fails**

Run:

```bash
DATABASE_URL='mysql://…' AUTH0_ISSUER_URL='https://…/' AUTH0_AUDIENCE='https://…' bun --cwd backend test:e2e -- collections.e2e-spec.ts
```

Expected: FAIL because `new UnauthorizedException()` returns only `statusCode` and `message` in NestJS 11.

- [x] **Step 5: Add the explicit unauthorized message in production and test guard code**

```ts
throw new UnauthorizedException('Unauthorized')
```

Apply this at both header-rejection paths in `auth.guard.ts`, both rejection paths in `auth0-jwt.service.ts`, and the `TestAuthGuard` fixture in `collections.e2e-spec.ts`.

- [x] **Step 6: Run the targeted E2E test and typecheck**

Run:

```bash
DATABASE_URL='mysql://…' AUTH0_ISSUER_URL='https://…/' AUTH0_AUDIENCE='https://…' bun --cwd backend test:e2e -- collections.e2e-spec.ts
bun --cwd backend typecheck
```

Expected: PASS.

- [x] **Step 7: Commit the tested contract**

```bash
git add backend/test/collections.e2e-spec.ts
git commit -m "✅ test: cover API error responses"
```

### Task 3: Close the checklist items

**Files:**
- Modify: `TASKS.md`

- [x] **Step 1: Mark the completed API and test items**

```md
- [x] Define common error response and HTTP status-code standards
- [x] Test request validation and common errors
```

- [x] **Step 2: Commit the checklist update**

```bash
git add TASKS.md
git commit -m "📝 docs: mark API error contract complete"
```

## Verification

- [x] Run the targeted Collections E2E test.
- [x] Run the complete backend E2E suite.
- [x] Run `bun --cwd backend typecheck`.
- [x] Verify `API_DESIGN.md` matches the asserted response bodies.

## Self-review

- Spec coverage: Tasks 1–3 cover the approved default NestJS format, explicit `401` error-field consistency, the `400/401/404` status matrix, E2E regression assertions, and checklist updates.
- Placeholder scan: Commands use redacted environment values deliberately; they must be supplied through the project's local environment, never committed.
- Type consistency: Tests use existing Supertest response bodies and existing deterministic collection ownership fixtures; no new application interfaces are introduced.

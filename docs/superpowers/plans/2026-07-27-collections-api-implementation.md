# Collections API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build owner-isolated Collection CRUD endpoints with validation, deletion behavior that unlinks bookmarks, and automated service plus HTTP coverage.

**Architecture:** A focused `CollectionsService` owns all Prisma access and receives the authenticated `ownerId` from the already-verified Auth0 claims. `CollectionsController` exposes CRUD routes behind the existing `AuthGuard`; it returns only safe collection fields. A global validation pipe validates DTOs before the controller runs.

**Tech Stack:** Node.js 22.12+, TypeScript strict mode, NestJS 11, Prisma 7, MySQL 8.4, Jest, Supertest, Bun.

## Global Constraints

- Derive the owner ID exclusively from verified Auth0 `sub`; never read it from request input.
- Use `id` and `ownerId` together for every read, update, and delete; return HTTP 404 for unowned resources.
- `name` is trimmed, non-empty, and at most 120 characters.
- `DELETE /collections/:id` preserves bookmarks and clears `collectionId` through the existing Prisma `onDelete: SetNull` relation.
- Keep `/healthz` public and protect all collection routes with the existing `AuthGuard`.
- Use Gitmoji commit subjects.

---

### Task 1: Document the Collections contract and deletion decision

**Files:**
- Modify: `API_DESIGN.md`
- Modify: `DECISIONS.md`
- Modify: `TASKS.md`

**Interfaces:**
- Produces: the six Collections endpoint contracts used by the controller and tests.

- [ ] **Step 1: Add Collections CRUD to `API_DESIGN.md`**

Add these exact routes and response shape:

```markdown
## Collections

All collection endpoints require a valid Bearer access token.

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| POST | /collections | { "name": "Work" } | 201 collection |
| GET | /collections | none | 200 collection[] |
| GET | /collections/:id | none | 200 collection |
| PUT | /collections/:id | { "name": "Work" } | 200 collection |
| PATCH | /collections/:id | { "name": "Work" } | 200 collection |
| DELETE | /collections/:id | none | 204 |
```

Document response fields as `id`, `name`, `createdAt`, and `updatedAt`; document `400` for invalid names and `404` for missing or unowned collections.

- [ ] **Step 2: Record collection deletion ADR**

Add ADR-002 to `DECISIONS.md`:

```markdown
## ADR-002: Preserve bookmarks when deleting a collection

**Decision:** Deleting a collection clears `Bookmark.collectionId` and preserves the bookmark.

**Rationale:** A collection is organization metadata; a user's saved bookmark remains valuable without it.

**Trade-off:** The product must provide an uncategorized bookmarks view.
```

- [ ] **Step 3: Update checklist only after verification**

After Task 5 passes, mark the Collections API contract, deletion decision, CRUD implementation, owner-scoped access, and Collections tests complete in `TASKS.md`.

- [ ] **Step 4: Commit**

```bash
git add API_DESIGN.md DECISIONS.md TASKS.md
git commit -m "📝 docs: define collections API contract"
```

### Task 2: Add DTOs, collection service, and unit tests

**Files:**
- Create: `backend/src/collections/dto/create-collection.dto.ts`
- Create: `backend/src/collections/dto/update-collection.dto.ts`
- Create: `backend/src/collections/collections.service.ts`
- Create: `backend/src/collections/collections.service.spec.ts`

**Interfaces:**
- Consumes: `ownerId: string`, `CreateCollectionDto`, `UpdateCollectionDto`, and `PrismaService`.
- Produces: `create`, `findAll`, `findOne`, `replace`, `update`, and `remove` service methods.

- [ ] **Step 1: Write failing service tests**

Create a mocked `PrismaService` and write these tests:

```ts
it('creates a collection for the authenticated owner', async () => {
  await service.create('auth0|user-a', { name: 'Work' });
  expect(prisma.collection.create).toHaveBeenCalledWith({
    data: { name: 'Work', ownerId: 'auth0|user-a' },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
});

it('throws NotFoundException when User A requests User B collection', async () => {
  prisma.collection.findFirst.mockResolvedValue(null);
  await expect(service.findOne('collection-b', 'auth0|user-a')).rejects.toBeInstanceOf(NotFoundException);
});

it('deletes only an owned collection', async () => {
  prisma.collection.findFirst.mockResolvedValue({ id: 'collection-a' });
  await service.remove('collection-a', 'auth0|user-a');
  expect(prisma.collection.delete).toHaveBeenCalledWith({ where: { id: 'collection-a' } });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
cd backend
bun run test -- collections.service.spec.ts
```

Expected: FAIL because DTOs and `CollectionsService` do not exist.

- [ ] **Step 3: Create DTOs**

Implement `CreateCollectionDto`:

```ts
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCollectionDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;
}
```

Implement `UpdateCollectionDto` with `@Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)`, `@IsOptional()`, and the same string, non-empty, and maximum-length validation rules.

- [ ] **Step 4: Implement the service**

Use this safe response selection in `collections.service.ts`:

```ts
const collectionSelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;
```

Implement `findOwned(id, ownerId)` with:

```ts
const collection = await this.prisma.collection.findFirst({
  where: { id, ownerId },
  select: collectionSelect,
});
if (!collection) throw new NotFoundException();
return collection;
```

Implement mutations by calling `findOwned` before `update` or `delete`. Trim `name` in `create`, `replace`, and `update` before sending it to Prisma.

- [ ] **Step 5: Run service tests to verify pass**

Run:

```bash
cd backend
bun run test -- collections.service.spec.ts
```

Expected: PASS for creation, owner scoping, replace, patch, and delete tests.

- [ ] **Step 6: Commit**

```bash
git add backend/src/collections
git commit -m "✨ feat: add owner-scoped collections service"
```

### Task 3: Add the protected Collections controller and global validation

**Files:**
- Create: `backend/src/collections/collections.controller.ts`
- Create: `backend/src/collections/collections.module.ts`
- Modify: `backend/src/app.module.ts`
- Modify: `backend/src/main.ts`

**Interfaces:**
- Consumes: `CollectionsService`, `@CurrentUser()`, `AuthGuard`, and DTOs.
- Produces: protected `/collections` CRUD HTTP endpoints.

- [ ] **Step 1: Write failing HTTP integration tests**

Create `backend/test/collections.e2e-spec.ts`. Override `AuthGuard` with this test guard so the suite can test unauthenticated and authenticated requests without a real Auth0 token:

```ts
class TestAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.headers.authorization !== 'Bearer test-user-a') {
      throw new UnauthorizedException();
    }
    request.user = { sub: 'auth0|user-a' };
    return true;
  }
}
```

Add tests for:

```ts
await request(app.getHttpServer()).get('/collections').expect(401);
await request(app.getHttpServer()).post('/collections').set('Authorization', 'Bearer test-user-a').send({ name: '   ' }).expect(400);
await request(app.getHttpServer()).post('/collections').set('Authorization', 'Bearer test-user-a').send({ name: 'Work' }).expect(201);
```

Use an isolated MySQL database referenced by `DATABASE_URL` and clean the `Bookmark`, `Collection`, and `User` tables before each test.

- [ ] **Step 2: Run integration tests to verify failure**

Run:

```bash
cd backend
DATABASE_URL="mysql://<TEST_DB_USER>:<TEST_DB_PASSWORD>@localhost:3307/bookmark_manager" bun run test:e2e -- collections.e2e-spec.ts
```

Expected: FAIL because the Collections controller and routes do not exist.

- [ ] **Step 3: Implement controller routes**

Create `CollectionsController` with `@Controller('collections')` and `@UseGuards(AuthGuard)`. Every method receives `@CurrentUser() user: VerifiedAuth0Claims` and passes `user.sub` to the service:

```ts
@Post()
create(@CurrentUser() user: VerifiedAuth0Claims, @Body() dto: CreateCollectionDto) {
  return this.collectionsService.create(user.sub, dto);
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
remove(@Param('id') id: string, @CurrentUser() user: VerifiedAuth0Claims) {
  return this.collectionsService.remove(id, user.sub);
}
```

Implement `GET`, `GET :id`, `PUT :id`, and `PATCH :id` with the same owner-ID flow.

- [ ] **Step 4: Enable validation globally**

In `main.ts`, add:

```ts
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
```

- [ ] **Step 5: Run integration tests to verify pass**

Run the same `test:e2e` command from Step 2. Expected: the unauthenticated request returns 401, invalid name returns 400, and owner CRUD flow passes.

- [ ] **Step 6: Commit**

```bash
git add backend/src/collections backend/src/app.module.ts backend/src/main.ts backend/test/collections.e2e-spec.ts
git commit -m "✨ feat: expose protected collections API"
```

### Task 4: Verify deletion behavior against MySQL

**Files:**
- Modify: `backend/test/collections.e2e-spec.ts`

**Interfaces:**
- Consumes: the existing `Bookmark.collectionId` foreign-key relation and the Collections delete endpoint.
- Produces: regression coverage that confirms collection deletion unlinks bookmarks.

- [ ] **Step 1: Write the failing deletion integration test**

Create User A, a collection owned by User A, and a bookmark with that collection ID. Delete the collection through `DELETE /collections/:id`, then assert:

```ts
expect(response.status).toBe(204);
expect(await prisma.bookmark.findUniqueOrThrow({ where: { id: bookmark.id } })).toMatchObject({
  id: bookmark.id,
  collectionId: null,
});
```

- [ ] **Step 2: Run the focused test to verify failure**

Run:

```bash
cd backend
DATABASE_URL="mysql://<TEST_DB_USER>:<TEST_DB_PASSWORD>@localhost:3307/bookmark_manager" bun run test:e2e -- collections.e2e-spec.ts
```

Expected: FAIL until the delete endpoint and migration are applied to the test database.

- [ ] **Step 3: Apply migrations to the test database**

Run:

```bash
cd backend
DATABASE_URL="mysql://<TEST_DB_USER>:<TEST_DB_PASSWORD>@localhost:3307/bookmark_manager" bunx prisma migrate deploy
```

- [ ] **Step 4: Run the deletion test to verify pass**

Run the same `test:e2e` command. Expected: the collection is deleted and the bookmark remains with `collectionId: null`.

- [ ] **Step 5: Commit**

```bash
git add backend/test/collections.e2e-spec.ts
git commit -m "✅ test: cover collection ownership and deletion"
```

### Task 5: Full verification and delivery status

**Files:**
- Modify: `TASKS.md`

**Interfaces:**
- Consumes: complete Collections service, controller, and test coverage.
- Produces: a branch ready for review and merge.

- [ ] **Step 1: Run all backend tests**

```bash
cd backend
bun run test
DATABASE_URL="mysql://<TEST_DB_USER>:<TEST_DB_PASSWORD>@localhost:3307/bookmark_manager" bun run test:e2e
```

Expected: all unit and Collections integration tests pass.

- [ ] **Step 2: Run repository verification**

```bash
cd ..
bun run typecheck
bun run build
```

Expected: all workspace typechecks and production builds pass.

- [ ] **Step 3: Update task checklist**

Mark the Collections CRUD contract, deletion decision, collection CRUD tasks, owner-scoped collection access, collection service tests, request validation tests, and collection deletion test as complete. Keep Bookmark and frontend tasks pending.

- [ ] **Step 4: Commit**

```bash
git add TASKS.md
git commit -m "📝 docs: record collections API verification"
```

# Bookmarks API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide authenticated users with private bookmark CRUD, optional collection assignment, and collection-scoped listing.

**Architecture:** Add a focused NestJS `BookmarksModule`. All bookmark reads and mutations derive the owner from the verified Auth0 subject; assignment and collection-filter requests first verify the collection belongs to that same owner, returning `404` otherwise. The database schema already models the nullable `Bookmark.collectionId` relation.

**Tech Stack:** NestJS 11, TypeScript, Prisma 7, MySQL 8, class-validator, Jest, Supertest.

## Global Constraints

- Every endpoint except `/healthz` requires `AuthGuard`.
- Do not accept `ownerId` from request bodies or expose it in responses.
- Return `404` for another user's bookmark or collection; do not leak resource existence.
- Validate URL, title, notes, and collection ID with DTOs and the existing global `ValidationPipe`.
- Use Bun with Node `v22.19.0` for commands.

---

### Task 1: Document the bookmark API contract

**Files:**
- Modify: `API_DESIGN.md`
- Modify: `TASKS.md`

- [ ] Add this contract:

| Method | Path | Body/query | Success |
| --- | --- | --- | --- |
| `POST` | `/bookmarks` | `{ url, title, notes?, collectionId? }` | `201` bookmark |
| `GET` | `/bookmarks` | optional `?collectionId=` | `200` bookmark array |
| `GET` | `/bookmarks/:id` | none | `200` bookmark |
| `PUT` | `/bookmarks/:id` | `{ url, title, notes?, collectionId? }` | `200` bookmark |
| `PATCH` | `/bookmarks/:id` | one or more mutable fields | `200` bookmark |
| `DELETE` | `/bookmarks/:id` | none | `204` |
| `GET` | `/collections/:id/bookmarks` | none | `200` bookmark array |

- [ ] State validation: `url` is a valid URL; `title` is trimmed/non-empty/max 255; `notes` is nullable and max 10,000; `collectionId` is a CUID or `null`.
- [ ] State ownership: all list/detail/mutation paths scope by `ownerId`; supplied collection IDs are checked against owner ID before use; a foreign collection or bookmark returns `404`.
- [ ] Commit:

```bash
git add API_DESIGN.md TASKS.md
git commit -m "📝 docs: define bookmarks API contract"
```

### Task 2: Build the owner-scoped bookmark service with unit tests

**Files:**
- Create: `backend/src/bookmarks/dto/create-bookmark.dto.ts`
- Create: `backend/src/bookmarks/dto/update-bookmark.dto.ts`
- Create: `backend/src/bookmarks/dto/list-bookmarks-query.dto.ts`
- Create: `backend/src/bookmarks/bookmarks.service.ts`
- Create: `backend/src/bookmarks/bookmarks.service.spec.ts`

**Interfaces:**

```ts
create(ownerId: string, dto: CreateBookmarkDto): Promise<BookmarkResponse>
findAll(ownerId: string, query: ListBookmarksQueryDto): Promise<BookmarkResponse[]>
findOne(id: string, ownerId: string): Promise<BookmarkResponse>
replace(id: string, ownerId: string, dto: CreateBookmarkDto): Promise<BookmarkResponse>
update(id: string, ownerId: string, dto: UpdateBookmarkDto): Promise<BookmarkResponse>
remove(id: string, ownerId: string): Promise<void>
findByCollection(collectionId: string, ownerId: string): Promise<BookmarkResponse[]>
```

- [ ] Write failing unit tests proving: create uses only the supplied owner; list adds owner and optional collection filter; foreign bookmark is `NotFoundException`; a foreign collection cannot be assigned; `collectionId: null` uncategorizes; delete is owner-scoped.
- [ ] Run red test:

```bash
cd backend
bun run test -- bookmarks.service.spec.ts
```

- [ ] Implement DTO transformation/validation and the smallest service. Use a response `select` containing `id`, `url`, `title`, `notes`, `collectionId`, `createdAt`, and `updatedAt`. Implement `findOwnedBookmark` and `findOwnedCollection` helpers using `{ id, ownerId }`.
- [ ] Run green test and typecheck:

```bash
bun run test -- bookmarks.service.spec.ts
bun run typecheck
```

- [ ] Commit:

```bash
git add backend/src/bookmarks
git commit -m "✨ feat: add owner-scoped bookmarks service"
```

### Task 3: Expose protected bookmark and collection-bookmark routes

**Files:**
- Create: `backend/src/bookmarks/bookmarks.controller.ts`
- Create: `backend/src/bookmarks/collection-bookmarks.controller.ts`
- Create: `backend/src/bookmarks/bookmarks.module.ts`
- Modify: `backend/src/app.module.ts`
- Create: `backend/test/bookmarks.e2e-spec.ts`

- [ ] Write failing e2e tests using the existing `TestAuthGuard` pattern. Cover `401`, invalid POST body, CRUD happy path, `GET /bookmarks?collectionId=`, and `GET /collections/:id/bookmarks`.
- [ ] Apply migrations to an isolated MySQL instance, then run the red test.
- [ ] Implement controllers with `@UseGuards(AuthGuard)` and `@CurrentUser()`. `CollectionBookmarksController` calls `findByCollection(id, user.sub)`, which verifies collection ownership first.
- [ ] Run e2e test until green.
- [ ] Commit:

```bash
git add backend/src/bookmarks backend/src/app.module.ts backend/test/bookmarks.e2e-spec.ts
git commit -m "✨ feat: expose private bookmarks API"
```

### Task 4: Verify authorization behavior and update delivery checklist

**Files:**
- Modify: `TASKS.md`

- [ ] Add e2e cases where User A cannot list a User B collection's bookmarks, or read, update, delete, filter, or assign User B's bookmark/collection by direct ID; expect `404` except the owner-scoped global bookmark list which excludes User B data.
- [ ] Run backend unit/e2e tests, typecheck, and build before integration.
- [ ] Mark Bookmark API contract, CRUD, filtering, owner-scoped access, and matching tests as complete in `TASKS.md`.
- [ ] Commit:

```bash
git add TASKS.md
git commit -m "📝 docs: record bookmarks API verification"
```

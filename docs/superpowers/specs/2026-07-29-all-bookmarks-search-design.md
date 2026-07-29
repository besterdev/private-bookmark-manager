# All Bookmarks and Full-Text Search Design

## Goal

Provide an authenticated `/all` view that presents every private bookmark grouped
by its collection, including uncategorised bookmarks. Add server-backed partial
text search to both `/all` and the existing `/bookmarks` page.

## Scope

- Add an optional `q` query parameter to `GET /bookmarks`.
- Search bookmark `title` and `notes` with one trimmed search term.
- Allow `q` and `collectionId` to be combined.
- Add the `/all` route and a navigation item named **All bookmarks**.
- Add search controls to `/all` and `/bookmarks`.
- Reuse the existing card grid and shared loading, error, and empty states.

No new database table, migration, autocomplete, saved searches, tag search, or
relevance ranking is included.

## API contract

`GET /bookmarks` accepts these optional query parameters:

| Parameter | Validation | Behaviour |
| --- | --- | --- |
| `collectionId` | CUID | Limits results to an owned collection; a missing or foreign collection returns `404`. |
| `q` | trimmed string, 1–120 characters when supplied | Matches a bookmark when its title or non-null notes contain the term. |

The resulting Prisma predicate remains an AND of `ownerId`, optional
`collectionId`, and the search OR condition. The API keeps its existing
created-at descending order and response shape. A blank or whitespace-only
`q` is treated as no search term by the frontend and is not sent.

## Frontend behaviour

### `/all`

The page fetches the current user's collections and bookmarks. It groups the
bookmark response client-side into sections for each collection that has one or
more matching bookmarks, followed by **Uncategorised** when that group has
results. Collection sections show the existing bookmark card grid.

The search field submits `q` to the bookmark list endpoint. While a search is
active, group headings continue to identify the matching bookmark's collection.
If no bookmarks match, the page shows the shared empty state with a search-aware
message. The page continues to show loading and retryable fetch errors through
the shared state components.

### `/bookmarks`

The existing collection filter remains available. The new search field is sent
with the selected collection ID when both are present. Search results replace
the card grid contents; the collection labels on cards remain unchanged.

## Privacy and error handling

Search terms never alter ownership checks. The backend only reads bookmarks for
the validated token subject. It never returns an `ownerId`, and combining a
foreign `collectionId` with `q` returns the existing generic `404` for a
collection, without exposing search results or collection existence.

Malformed query values return the documented `400` validation error. Network
failures retain the existing safe retry UI; backend error details are not
rendered directly.

## Test coverage

- Backend integration tests: title match, notes match, no match, query
  validation, `q` plus an owned collection filter, and foreign-user isolation.
- Frontend tests: `/all` grouping, uncategorised group, search request URL,
  matching empty state, and `/bookmarks` combining search with its collection
  filter.
- Existing bookmark CRUD and collection behaviour remain unchanged.

## Acceptance criteria

1. A signed-in user can open `/all` and see their bookmarks under their
   collections and an uncategorised section where applicable.
2. Searching from `/all` or `/bookmarks` finds only that user's bookmarks whose
   title or notes contain the term.
3. `/bookmarks` can apply search and collection filters together.
4. A foreign user's bookmarks or collection identifiers cannot produce results.
5. Relevant backend and frontend tests cover the behaviour.

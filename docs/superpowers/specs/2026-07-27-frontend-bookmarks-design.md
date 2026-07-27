# Bookmarks Workspace Design

## Goal

Build an authenticated Bookmarks workspace that lists, filters, creates, selects, opens, and deletes private bookmarks through the existing API.

## Layout

- Desktop uses a list and detail panel, consistent with the Collections workspace.
- The toolbar has a collection filter (`All bookmarks`, `Uncategorized`, and each collection) and a Create bookmark action.
- Each list item exposes title, hostname, and collection label. Detail shows title, URL, notes, collection, and an external open-link action.

## Data flow

The page fetches `/collections` once for filter/form choices and `/bookmarks` or `/bookmarks?collectionId=<id>` whenever the filter changes. Creation posts `{ url, title, notes?, collectionId? }`; delete removes the selected item locally. `null` collection IDs represent uncategorized bookmarks.

## States

- Loading indicator, retryable API error, empty filter result, and form validation for URL/title.
- Create dialog validates trimmed title and URL before the API call.
- Delete uses an explicit confirmation dialog.

## Scope

CRUD controls are create/list/detail/delete; backend PUT/PATCH exist but inline edit is intentionally deferred. The next documentation pass will mark that delivery scope explicitly.

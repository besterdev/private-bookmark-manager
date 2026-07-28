# Collection Bookmark Card Grid

## Goal

Show the bookmarks belonging to the selected collection as a responsive visual grid.

## Scope

- Fetch `GET /collections/:id/bookmarks` when the selected collection changes.
- Show bookmark cards in three columns on desktop, two on tablet, and one on mobile.
- Each card shows an image preview, title, and URL.
- Selecting a card opens the bookmark URL in a new tab with `rel="noreferrer"`.
- A bookmark without an image uses a design-system placeholder.

## Components

- `CollectionDetail` owns the selected-collection request and its loading, empty, and error states.
- `BookmarkCardGrid` owns the responsive layout.
- `BookmarkCard` owns link semantics and card presentation.

## States

- Loading: skeleton cards are shown while bookmarks are requested.
- Empty: a clear message states that the collection has no bookmarks.
- Error: an error message provides a Retry action.

## Testing

- The grid renders bookmark title and URL.
- Each card links to its bookmark URL in a new tab safely.
- Loading, empty, and error states are visible at the component boundary.

## Non-goals

- Generating or persisting link-preview images.
- Changing bookmark API contracts or database schema.

# Bookmarks Grid Card Redesign

## Goal

Redesign the Bookmarks page as a responsive grid of visual cards while retaining the established light design system.

## Scope

- Replace the current list/detail layout with a full-width card grid.
- Use three columns on desktop, two on tablet, and one on mobile.
- Retain the current collection filter, create-bookmark flow, and authenticated API client.
- Each card shows a preview placeholder, title, URL, notes when present, and its collection name or an Unsorted label.
- Selecting a card opens the bookmark URL in a new tab using `rel="noreferrer"`.
- Move bookmark deletion into an action menu on each card.

## Components

- `BookmarksPage` continues to own loading, error, collection filter, create, and delete state.
- `BookmarkCardGrid` renders the responsive layout.
- `BookmarkCard` renders external-link semantics, metadata, and the delete action trigger.

## States

- Loading: retain the current MUI progress indicator.
- Empty: show a clear message when the active filter has no bookmarks.
- Error: retain the page error alert.

## Styling

- Use the current light palette: Smalt `#003399`, Blaze Orange `#FF6E00`, and Mine Shaft `#3F3F3F`.
- Preview placeholders use the existing palette because bookmark data has no image URL.
- Preserve responsive MUI layout and accessible button/link labels.

## Testing

- Card links use the bookmark URL, a new tab, and `rel="noreferrer"`.
- Grid renders the active filter's cards and empty state.
- Delete action identifies the selected bookmark before opening the existing confirmation dialog.

## Non-goals

- Bookmark image scraping or API/database changes.
- Editing bookmark fields.
- A dark-theme variant of the Bookmarks page.

# Collections Workspace Design

## Goal

Build the authenticated Collections UI as a responsive single-page workspace that lists, creates, selects, and deletes private collections through the existing backend API.

## Layout

- Desktop: a left collection list panel and a right detail panel within the existing application shell.
- Mobile: the selected detail panel replaces the list; a back action returns to the list.
- A primary Create collection action is always available.

## Data flow

`CollectionsPage` obtains `getAccessTokenSilently` from Auth0, creates the shared API client, and calls `GET /collections` on mount. The selected collection remains local UI state. Creation posts `{ name }`, prepends or refreshes the result, and selects it. Delete opens a confirmation dialog, calls `DELETE /collections/:id`, removes the result from state, and selects the next available collection.

## States

- Loading: skeleton/list progress while the initial request is pending.
- Empty: explain that no collections exist and provide a Create action.
- Error: dismissible API error with retry.
- Validation: inline trimmed, required collection-name error.
- Detail: selected collection metadata and an explicit placeholder noting bookmark content will arrive in the next feature.

## API client extension

Extend the existing client with `post`, `delete`, and a no-content-safe response parser. Every request continues to carry the Auth0 access token.

## Test scope

- API client tests for POST and DELETE authorization/error behavior.
- Component tests for empty state and collection-name validation.
- Frontend test, typecheck, and production build.

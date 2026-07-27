# Private Bookmark Manager UI Design

## Goal

Create a light, desktop-first bookmark-management workspace inspired by the information density and rapid scanning of Raindrop. The interface must support private collections and bookmarks without introducing social or shared-content patterns.

## Design direction

**Library Workspace**: a persistent collection navigator, a focused management toolbar, and a dense but readable bookmark library. The experience should feel like a practical personal tool rather than a public content feed.

The memorable interaction is the combination of a calm, light canvas with a strong Smalt navigation anchor and a single Blaze Orange action button. Content remains the focus; colour communicates navigation and intent.

## Information architecture

### Primary navigation

- All Bookmarks
- Unsorted
- Collections
- Create collection

The sidebar is persistent on desktop and becomes a temporary MUI Drawer on mobile.

### Main workspace

1. **Top bar**: page title, search field, collection filter, layout control, and primary `Add bookmark` action.
2. **Collection context**: when a collection is selected, show its name, bookmark count, and collection actions.
3. **Bookmark library**: responsive card grid with bookmark metadata and actions.
4. **Feedback states**: loading skeletons, empty state, safe error alert, and success feedback after mutations.

## Page and component design

### Application shell

- MUI `AppBar` contains the compact mobile navigation trigger and page-level actions.
- MUI `Drawer` is 264px wide on desktop.
- The shell has an off-white background; the content area uses white cards with restrained shadows and borders.
- Selected navigation has a Smalt background or indicator with clear text contrast.

### Bookmark list

- MUI `TextField` with search icon for keyword search.
- MUI `Select` or `Autocomplete` for filtering by collection.
- MUI `Card` presents favicon, title, hostname, collection `Chip`, optional notes excerpt, and an overflow `Menu`.
- Cards support keyboard focus, expose full titles via tooltip where necessary, and never depend on colour alone for status.

### Collection management

- Collection list entries show name and bookmark count.
- MUI `Dialog` handles create, rename, and delete confirmation.
- The delete dialog must explain the API-defined bookmark behaviour before confirmation.

### Bookmark management

- MUI `Dialog` or right-side `Drawer` contains create/edit form fields: URL, title, notes, and optional collection.
- Form validation is inline and uses the backend error contract as the source of truth.

## Design system

Detailed typography, component, colour, layout, and semantic HTML references are maintained in [`DESIGN_SYSTEM.md`](../../../DESIGN_SYSTEM.md).

### Core colours

| Token | Value | Usage |
| --- | --- | --- |
| `primary.main` | `#003399` | navigation, links, selected controls, primary non-destructive actions |
| `secondary.main` | `#FF6E00` | add-bookmark CTA, high-attention highlights, focus accent |
| `text.primary` | `#3F3F3F` | primary typography and high-emphasis icons |
| `background.default` | `#F7F8FC` | workspace canvas |
| `background.paper` | `#FFFFFF` | cards, menus, dialogs, sidebar surfaces |
| `divider` | `#E5E7EB` | subtle boundaries |

Orange is reserved for the primary creation action and must not be used for destructive actions. Destructive actions use MUI error tokens.

### Typography and spacing

- Use MUI typography scale with a clear hierarchy: page title, collection title, bookmark title, metadata, notes.
- Use 8px spacing increments.
- Use 12px corner radius for cards and 10px for controls to keep the workspace friendly but professional.
- Card content uses a 16px minimum internal padding and maintains readable line lengths.

### Component rules

- Use MUI `Button`, `IconButton`, `Chip`, `Card`, `Drawer`, `Dialog`, `Menu`, `TextField`, `Alert`, and `Skeleton`; do not recreate their accessible primitive behaviour.
- Build a single MUI theme extension for colour, typography, shape, and component defaults.
- Create thin feature components rather than one page-sized component: `AppShell`, `CollectionNav`, `BookmarkToolbar`, `BookmarkCard`, `BookmarkForm`, and `EmptyState`.

## Responsive behaviour

| Breakpoint | Layout |
| --- | --- |
| Desktop (`md` and above) | Persistent sidebar and 3-4 card columns depending on viewport width |
| Tablet (`sm` to `md`) | Collapsible sidebar and 2 card columns |
| Mobile (below `sm`) | Temporary drawer, stacked toolbar controls, and 1 card column |

The `Add bookmark` action remains visible on every breakpoint. Tables are not used for the core bookmark view, avoiding horizontal scrolling on mobile.

## Accessibility

- Meet WCAG AA contrast for text and controls.
- Provide visible keyboard focus states using a Smalt outline with Orange emphasis only where contrast remains sufficient.
- Use accessible labels for icon-only controls and form fields.
- Ensure dialogs trap focus and return focus to their trigger after close.
- Support keyboard navigation for sidebar items, cards, menus, and forms.

## Data and error handling

- Frontend reads bookmarks and collections only through the documented backend API.
- Loading uses MUI `Skeleton`; empty collections explain the next action; errors use non-sensitive MUI `Alert` messages.
- The authenticated user identity comes from `/me`; no `ownerId` is displayed or submitted from the UI.
- API authorization failures should not expose another user's data or existence.

## Verification plan

- Component tests cover navigation selection, collection filtering, bookmark form validation, and loading/empty/error states.
- E2E tests cover login, create/delete collection, create/delete/filter bookmark, responsive navigation, and cross-user privacy boundaries.
- Visual QA checks desktop, tablet, and mobile layouts for overflow, contrast, focus visibility, and action discoverability.

## Out of scope

- Public feeds, shared browsing, and user-to-user sharing UI.
- Full-text search implementation beyond the UI search affordance.
- The optional `/all` page.

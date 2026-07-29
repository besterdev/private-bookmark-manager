# Minimal-Inspired Frontend Refinement Design

## Goal

Refine the Private Bookmark Manager frontend with MUI-based patterns inspired
by the Minimal UI component catalog while retaining the approved Bangkok Bank
colour system. Fix the reviewed mobile navigation, inactive delete action, and
missing font loading, then record the resulting rules in reusable agent
playbooks.

## Design source and constraints

Minimal UI is a visual and interaction reference only. The implementation uses
the project's existing MUI components and does not copy Minimal UI source,
templates, or paid assets.

The existing brand colours remain authoritative:

- Smalt blue `#003399` for primary actions and active navigation.
- Blaze orange `#FF6E00` for focused accents.
- Mine Shaft `#3F3F3F` for primary text.
- Light surfaces, subtle borders, restrained shadows, and generous spacing.

No backend contract, database schema, Auth0 flow, or ownership rule changes.

## Theme foundation

Move theme construction into a focused frontend theme module. Load Public Sans
in `frontend/index.html` and use it consistently across body and heading
variants. Add component overrides for buttons, cards, text fields, chips, and
drawers so pages share radius, elevation, hover, and focus behaviour instead of
repeating local styling.

The visual direction is refined and utilitarian: calm surfaces, dense enough
for bookmark management, with blue as the dominant colour and orange used
sparingly. Motion is limited to short drawer, card-hover, and focus transitions.

## Responsive application shell

Keep the permanent navigation drawer at desktop widths. Below the `md`
breakpoint, render a labelled menu button in the app bar and a temporary MUI
drawer containing the same navigation list. Selecting a mobile navigation item
closes the drawer. The current route remains visually and programmatically
identifiable, and keyboard users can open, navigate, and dismiss the drawer.

The app bar keeps the product title and authenticated account/logout action,
with responsive truncation so neither obscures the mobile menu button.

## Shared bookmark presentation

Refine the existing bookmark card rather than introducing a second card
implementation. Cards keep the external link as the primary action, retain
collection labels, and use a consistent 16:9 branded fallback visual because
the current API has no preview-image field. Hover and focus styling must not
reduce text contrast or hide keyboard focus.

Extract a shared bookmark deletion confirmation component. Both `/bookmarks`
and `/all` use the same confirmation copy, DELETE request, success removal, and
safe error state. The `/all` page must never render a delete button backed by a
no-op callback.

## Search and filter composition

Create a shared visual search toolbar that composes existing MUI TextField,
Button, and optional collection-select content. `/all` uses search only;
`/bookmarks` uses search plus its existing collection filter. Each page retains
ownership of query state and API requests so the shared component remains
presentational.

Loading, empty, and error states continue to use the existing shared state
components. Search submission remains explicit and trims whitespace before
requesting `GET /bookmarks?q=`.

## Reusable agent updates

Implement the previously approved `.agent/` playbooks and add these frontend
rules:

- `.agent/frontend-ui-tests.md` requires the Minimal-inspired MUI theme,
  approved colour tokens, Public Sans loading, responsive navigation,
  accessible labels, visible focus, and real behaviour for every displayed
  action.
- `.agent/quality-review.md` checks mobile route access, inactive controls,
  font availability, keyboard navigation, shared state coverage, and visual
  consistency before merge.
- `.agent/backend-api-security.md` retains the Auth0, API validation, Prisma
  ownership, and two-user isolation requirements from the reusable-agent
  design.
- `.agent/README.md` routes tasks to the appropriate playbook and explains when
  frontend work also requires the quality reviewer.

## Testing

- App-shell tests cover opening, dismissing, and closing the temporary drawer
  after mobile navigation.
- `/all` tests cover delete confirmation, successful removal, and safe failure
  handling.
- Shared search-toolbar tests cover labelled controls and submit behaviour.
- Existing bookmark, collections, Auth0, loading, empty, and error tests remain
  green.
- Frontend lint, typecheck, tests, and production build are required before
  merge.

## Acceptance criteria

1. Desktop and mobile users can reach `/all`, `/collections`, and `/bookmarks`.
2. All bookmark delete controls perform a real confirmed delete or are not
   rendered.
3. Public Sans is loaded and applied through the shared MUI theme.
4. Bookmark cards, navigation, buttons, inputs, chips, and shared states form a
   coherent Minimal-inspired light interface using the approved brand colours.
5. The reusable agent playbooks exist and encode the new frontend and review
   rules without weakening backend privacy requirements.
6. Relevant frontend tests, lint, typecheck, and build pass.

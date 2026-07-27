# Private Bookmark Manager - Design System

## Design principles

- **Private workspace first:** minimise visual noise and make personal bookmark management feel focused.
- **Fast scanning:** title, hostname, collection, and quick actions are visible without opening a bookmark.
- **One clear action:** Blaze Orange is reserved for creating a bookmark.
- **Accessible by default:** MUI primitives, keyboard support, visible focus, and WCAG AA colour contrast.

## Colour tokens

| Token | Hex | Purpose |
| --- | --- | --- |
| `primary.main` | `#003399` | Main navigation, links, selected states, non-destructive primary actions |
| `primary.dark` | `#002570` | Hover and active state for primary controls |
| `secondary.main` | `#FF6E00` | Add Bookmark CTA and high-attention accent |
| `secondary.dark` | `#CC5800` | CTA hover and active state |
| `text.primary` | `#3F3F3F` | Primary text and strong icons |
| `text.secondary` | `#666666` | Metadata, hostname, and supporting text |
| `background.default` | `#F7F8FC` | Application workspace background |
| `background.paper` | `#FFFFFF` | Drawer, cards, menus, dialogs, and inputs |
| `divider` | `#E5E7EB` | Boundaries between sections and cards |
| `error.main` | `#C62828` | Destructive actions and validation errors |
| `success.main` | `#2E7D32` | Mutation success feedback |

### Colour usage rules

- Do not use Orange for delete actions, warnings, or generic decoration.
- Use Smalt for persistent navigation and links; do not apply it to entire content panels.
- Use Dark Gray for readable text, not as a large background block in the light workspace.
- Error and success use MUI semantic colours rather than custom shades.

## Typography

Use **Manrope** for display and UI headings, paired with **Source Sans 3** for body copy and dense metadata. Both are clean at small sizes without the generic dashboard look.

| Token | Font | Size / line height | Weight | Usage |
| --- | --- | --- | --- | --- |
| `h1` | Manrope | 28px / 36px | 700 | Page title: All Bookmarks |
| `h2` | Manrope | 22px / 30px | 700 | Collection name / dialog title |
| `h3` | Manrope | 18px / 26px | 650 | Section title |
| `subtitle1` | Source Sans 3 | 16px / 24px | 600 | Bookmark card title |
| `body1` | Source Sans 3 | 15px / 22px | 400 | Notes and regular copy |
| `body2` | Source Sans 3 | 14px / 20px | 400 | Supporting content |
| `caption` | Source Sans 3 | 12px / 16px | 500 | Hostname, counts, metadata |
| `button` | Manrope | 14px / 20px | 700 | Buttons and primary controls |

Typography rules:

- Bookmark titles clamp at two lines; notes clamp at two lines.
- Use sentence case for UI labels and buttons.
- Avoid all-caps except compact metadata labels when necessary.

## Spacing, shape, and elevation

| Token | Value | Usage |
| --- | --- | --- |
| Base space | 8px | Spacing scale unit |
| `space.1` | 8px | Tight icon or label spacing |
| `space.2` | 16px | Card padding and form gaps |
| `space.3` | 24px | Section spacing |
| `space.4` | 32px | Page spacing |
| `radius.control` | 10px | Inputs, buttons, chips |
| `radius.card` | 12px | Bookmark cards and panels |
| `shadow.card` | `0 2px 10px rgba(17, 24, 39, 0.06)` | Resting bookmark card |

## MUI component system

| Component | Variant and behaviour |
| --- | --- |
| `Drawer` | 264px permanent sidebar on desktop; temporary drawer below `md` |
| `AppBar` | White, bottom divider, no heavy elevation |
| `Button` | Orange contained button for Add Bookmark; Smalt outlined/text actions otherwise |
| `IconButton` | Neutral at rest; Smalt hover state; accessible `aria-label` required |
| `TextField` | White surface, 10px radius, Smalt focus outline |
| `Autocomplete` | Collection filter and collection selector in forms |
| `Card` | White, 12px radius, divider border, subtle shadow; lifts slightly on hover |
| `Chip` | Soft Smalt-tinted collection label; never relies on colour alone |
| `Menu` | Edit, move, and delete actions; delete separated with a divider and error colour |
| `Dialog` | Create/edit/delete flows, clear heading, explicit cancel and confirm actions |
| `Skeleton` | Bookmark-card shape while initial data is loading |
| `Alert` | API error and successful mutation feedback |

## Layout system

```text
Desktop
┌───────────────┬──────────────────────────────────────────────────────────┐
│ Drawer        │ App bar: page title | search | filter | Add bookmark     │
│ 264px         ├──────────────────────────────────────────────────────────┤
│               │ Collection context                                        │
│ All Bookmarks │                                                          │
│ Unsorted      │ Bookmark card grid                                        │
│ Collections   │ [card] [card] [card]                                     │
│ + Collection  │ [card] [card] [card]                                     │
└───────────────┴──────────────────────────────────────────────────────────┘

Mobile
┌─────────────────────────────────────────────┐
│ Menu | Page title              | Add button  │
│ Search                                      │
│ Collection filter                           │
│ [ Bookmark card ]                           │
│ [ Bookmark card ]                           │
└─────────────────────────────────────────────┘
```

## HTML reference structure

This semantic structure is the UI blueprint. Production implementation should use React components and MUI equivalents, not hand-written replacement controls.

```html
<div class="app-shell">
  <aside class="collection-nav" aria-label="Bookmark collections">
    <a class="brand" href="/bookmarks">Private Bookmark Manager</a>
    <nav>
      <a class="nav-item is-selected" href="/bookmarks">All Bookmarks</a>
      <a class="nav-item" href="/bookmarks?collection=unsorted">Unsorted</a>
      <p class="nav-label">Collections</p>
      <a class="nav-item" href="/collections/engineering">Engineering <span>12</span></a>
      <button type="button" class="text-action">Create collection</button>
    </nav>
  </aside>

  <main class="workspace">
    <header class="toolbar">
      <div>
        <h1>All Bookmarks</h1>
        <p>24 private bookmarks</p>
      </div>
      <div class="toolbar-actions">
        <label class="sr-only" for="bookmark-search">Search bookmarks</label>
        <input id="bookmark-search" type="search" placeholder="Search bookmarks" />
        <select aria-label="Filter by collection">
          <option>All collections</option>
          <option>Engineering</option>
        </select>
        <button type="button" class="button button-primary">Add bookmark</button>
      </div>
    </header>

    <section aria-labelledby="bookmark-library-title">
      <h2 id="bookmark-library-title" class="sr-only">Bookmark library</h2>
      <div class="bookmark-grid">
        <article class="bookmark-card">
          <div class="bookmark-card__header">
            <img src="/favicon.svg" alt="" width="20" height="20" />
            <button type="button" aria-label="Bookmark actions">More</button>
          </div>
          <h3>Designing reliable APIs</h3>
          <a href="https://example.com">example.com</a>
          <span class="collection-chip">Engineering</span>
          <p>A practical guide to predictable API contracts and error handling.</p>
        </article>
      </div>
    </section>
  </main>
</div>
```

## MUI theme shape

```ts
const theme = createTheme({
  palette: {
    primary: { main: '#003399', dark: '#002570' },
    secondary: { main: '#FF6E00', dark: '#CC5800' },
    text: { primary: '#3F3F3F', secondary: '#666666' },
    background: { default: '#F7F8FC', paper: '#FFFFFF' },
  },
  shape: { borderRadius: 10 },
  spacing: 8,
});
```

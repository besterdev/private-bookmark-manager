# Review package: 8064b3e..HEAD

## Commits
3d6f89c 📝 docs: make agent review workflow safe
e0aece7 📝 docs: add reusable engineering playbooks
99e05fe 🔒 fix: hide bookmark deletion error details
e0f8e67 🐛 fix: enable deletion from all bookmarks
d3eb361 ♿️ fix: show focus outlines on navigation controls
171c95b ✨ feat: add responsive app navigation
d3130f3 💄 style: apply Minimal-inspired bookmark theme

## Files changed
 .agent/README.md                                   | 46 ++++++++++++++
 .agent/backend-api-security.md                     | 51 ++++++++++++++++
 .agent/frontend-ui-tests.md                        | 50 +++++++++++++++
 .agent/quality-review.md                           | 48 +++++++++++++++
 TASKS.md                                           |  2 +-
 frontend/index.html                                |  5 +-
 frontend/src/App.test.tsx                          | 48 ++++++++++++++-
 frontend/src/App.tsx                               | 28 +--------
 .../src/features/bookmarks/BookmarkCard.test.tsx   | 10 +++
 frontend/src/features/bookmarks/BookmarkCard.tsx   |  8 +--
 .../bookmarks/BookmarkDeleteDialog.test.tsx        | 34 +++++++++++
 .../features/bookmarks/BookmarkDeleteDialog.tsx    | 22 +++++++
 .../bookmarks/BookmarkSearchToolbar.test.tsx       | 19 ++++++
 .../features/bookmarks/BookmarkSearchToolbar.tsx   | 37 +++++++++++
 frontend/src/layout/AppShell.tsx                   | 40 +++++++++---
 frontend/src/routes/AllBookmarksPage.test.tsx      | 35 ++++++++++-
 frontend/src/routes/AllBookmarksPage.tsx           | 54 ++++++++--------
 frontend/src/routes/BookmarksPage.test.tsx         | 34 ++++++++++-
 frontend/src/routes/BookmarksPage.tsx              | 47 ++++----------
 frontend/src/theme.ts                              | 71 ++++++++++++++++++++++
 20 files changed, 587 insertions(+), 102 deletions(-)

## Diff
diff --git a/.agent/README.md b/.agent/README.md
new file mode 100644
index 0000000..b482afc
--- /dev/null
+++ b/.agent/README.md
@@ -0,0 +1,46 @@
+# Reusable Agent Playbooks
+
+## Purpose
+
+Route each change to one focused repository-local playbook so implementation and review follow the project's security, UI, and verification rules.
+
+## Use when
+
+- Use [Backend API and security](backend-api-security.md) for NestJS, Prisma, Auth0, endpoint, DTO, migration, or backend-test work.
+- Use [Frontend UI and tests](frontend-ui-tests.md) for React, MUI, routes, API-consumer, accessibility, responsive UI, or Vitest work.
+- Use [Quality review](quality-review.md) for a read-only pre-merge assessment and verification report.
+- Use the frontend playbook and then the quality-review playbook when a frontend change affects visible UI, navigation, interactions, accessibility, or shared states.
+
+## Read first
+
+Read `AGENTS.md`, `API_DESIGN.md`, `DECISIONS.md`, and `AI_WORKFLOW.md`. Also read the relevant approved design specification and existing tests before changing code.
+
+## Guardrails
+
+- Use Bun for dependency management and commands; keep TypeScript strict.
+- Never expose secrets, access tokens, database credentials, or connection strings.
+- Keep frontend and backend boundaries explicit: the frontend calls documented HTTP endpoints only and never accesses Prisma or the database.
+- Work in a feature worktree with focused Gitmoji commits; preserve unrelated changes and obtain approval before merging.
+
+## Workflow
+
+1. Select one primary playbook based on the requested change.
+2. Follow its scoped workflow and add relevant tests and documentation updates.
+3. Escalate ambiguous product or security decisions to `DECISIONS.md` before implementation.
+4. Use the review playbook before merge when the change has implementation impact.
+
+## Commands
+
+Run the narrowest relevant command first, then the applicable workspace checks:
+
+```bash
+bun run lint
+bun run typecheck
+bun run test
+bun run test:e2e
+bun run build
+```
+
+## Definition of done
+
+The selected playbook's checks pass or are reported exactly, documentation matches the behavior, privacy is preserved, and no secrets are exposed.
diff --git a/.agent/backend-api-security.md b/.agent/backend-api-security.md
new file mode 100644
index 0000000..0e82611
--- /dev/null
+++ b/.agent/backend-api-security.md
@@ -0,0 +1,51 @@
+# Backend API and Security Playbook
+
+## Purpose
+
+Safely change NestJS APIs, Auth0 authentication, Prisma data access, and backend tests while preserving strict per-user privacy.
+
+## Use when
+
+Use for controllers, services, DTOs, guards, Auth0 validation, Prisma schema or migrations, API contracts, and Jest or Supertest coverage.
+
+## Read first
+
+Read `AGENTS.md`, `API_DESIGN.md`, `DECISIONS.md`, and `AI_WORKFLOW.md`, then inspect the affected implementation and tests.
+
+## Guardrails
+
+- Use Bun and strict TypeScript; never expose secrets, tokens, or database credentials.
+- Require a validated Auth0 **access token**, not an ID token. Verify issuer, audience, RS256 signature through JWKS, expiry, algorithm, and a non-empty `sub`.
+- Derive the authenticated owner only from the validated Auth0 `sub`; never accept `ownerId` from request input.
+- Include owner scope in every Prisma read and mutation. Foreign or missing resources must return the same `404` behavior so existence cannot be inferred.
+- Validate create, replace, patch, and filter input with DTOs and retain the documented error shape.
+- Keep collection deletion behavior: delete the collection, clear `Bookmark.collectionId`, and preserve bookmarks.
+- Keep database access on the backend and document every public HTTP contract in `API_DESIGN.md`.
+- Make changes in an isolated feature worktree, keep commits focused with accurate Gitmoji subjects, and merge only after required checks and review pass with explicit approval.
+
+## Workflow
+
+1. Define the requested behavior, ownership rule, validation rule, and failure response.
+2. Update `API_DESIGN.md` and `DECISIONS.md` when a contract or decision changes.
+3. Implement authenticated controller and service behavior with owner-scoped Prisma queries.
+4. Add unit or integration coverage for valid input, invalid input, and two-user isolation.
+5. Confirm User A cannot list, read, create against, update, delete, filter, or infer User B's collections or bookmarks.
+6. Run focused backend checks, then applicable workspace checks, and report exact outcomes.
+7. Request review and explicit approval before merging the focused feature-worktree commits.
+
+## Commands
+
+```bash
+bun --cwd backend test
+bun --cwd backend run lint
+bun --cwd backend run typecheck
+bun run test
+bun run test:e2e
+bun run build
+```
+
+Use the narrowest affected test file or suite before the broader commands.
+
+## Definition of done
+
+Auth0 identity is validated from `sub`, all resource access is owner-scoped, foreign access returns `404`, DTO validation and API documentation match behavior, two-user tests cover isolation, applicable checks have exact reported results, and the focused Gitmoji commits are reviewed and explicitly approved before merge.
diff --git a/.agent/frontend-ui-tests.md b/.agent/frontend-ui-tests.md
new file mode 100644
index 0000000..acdb4a8
--- /dev/null
+++ b/.agent/frontend-ui-tests.md
@@ -0,0 +1,50 @@
+# Frontend UI and Tests Playbook
+
+## Purpose
+
+Build and verify accessible React and MUI experiences that consume only the documented API and remain coherent with the approved Minimal-inspired design system.
+
+## Use when
+
+Use for React routes, feature modules, MUI components, authenticated API consumers, forms, responsive navigation, shared states, and Vitest coverage.
+
+## Read first
+
+Read `AGENTS.md`, `API_DESIGN.md`, `DECISIONS.md`, and `AI_WORKFLOW.md`, then the approved frontend design specification and affected tests.
+
+## Guardrails
+
+- Use Bun and strict TypeScript; never expose secrets or log Auth0 access tokens in the browser.
+- Keep routes thin and feature logic in `frontend/src/features/<feature>`; call documented HTTP endpoints only. Never access Prisma or the database from the frontend.
+- Preserve the approved brand tokens: Smalt blue `#003399`, Blaze orange `#FF6E00`, Mine Shaft `#3F3F3F`, light surfaces, subtle borders, restrained shadows, and generous spacing.
+- Load and apply Public Sans through the shared MUI theme. Use existing Minimal-inspired MUI patterns and shared component overrides rather than page-specific visual drift.
+- Preserve desktop permanent navigation and the labelled temporary mobile drawer below `md`; mobile route selection closes the drawer and the current route stays identifiable.
+- Give controls accessible labels, visible keyboard focus, and real behavior. A displayed action must perform its intended behavior or not render; never ship a no-op control.
+- Handle loading, empty, success, validation, and safe error states with the shared state components. Treat API errors as untrusted and avoid displaying sensitive server details.
+- Make changes in an isolated feature worktree, keep commits focused with accurate Gitmoji subjects, and merge only after required checks and review pass with explicit approval.
+
+## Workflow
+
+1. Confirm the API contract and approved design rules before implementation.
+2. Keep query and API-request state owned by the relevant route; extract only presentational shared UI where it has a current use.
+3. Implement real interactions, including confirmation and safe failure behavior for destructive actions.
+4. Add or update Vitest coverage for accessible controls, navigation, submitted actions, and success/failure states.
+5. Exercise keyboard flow for menus, drawers, dialogs, and actionable controls.
+6. Run focused frontend tests, then lint, typecheck, and build.
+7. Use the quality-review playbook and obtain explicit approval before merging the focused feature-worktree commits.
+
+## Commands
+
+```bash
+bun --cwd frontend test
+bun --cwd frontend lint
+bun --cwd frontend typecheck
+bun --cwd frontend build
+bun run test:e2e
+```
+
+Use the narrowest affected Vitest file before the broader commands.
+
+## Definition of done
+
+The UI uses approved tokens and Public Sans, responsive navigation works at desktop and mobile widths, every displayed action is real and accessible, shared states are covered, API boundaries are preserved, applicable checks have exact reported results, and the focused Gitmoji commits are reviewed and explicitly approved before merge.
diff --git a/.agent/quality-review.md b/.agent/quality-review.md
new file mode 100644
index 0000000..f1886b4
--- /dev/null
+++ b/.agent/quality-review.md
@@ -0,0 +1,48 @@
+# Quality Review Playbook
+
+## Purpose
+
+Provide a focused, evidence-based pre-merge review of privacy, API/UI behavior, documentation, and verification outcomes.
+
+## Use when
+
+Use after an implementation is ready for review, before merge, or when a contributor requests a read-only assessment of a diff.
+
+## Read first
+
+Read `AGENTS.md`, `API_DESIGN.md`, `DECISIONS.md`, and `AI_WORKFLOW.md`, then the relevant approved design specification, tests, and diff against `main`.
+
+## Guardrails
+
+- Remain read-only until a finding is approved for repair; do not modify source, tests, configuration, or documentation during review.
+- Use Bun and retain strict TypeScript expectations. Never expose secrets, access tokens, or database credentials in review notes.
+- Prioritise actionable privacy and security findings before lower-risk UI or maintainability observations.
+- Report exact command outcomes as passed, failed, or skipped; do not describe an unrun command as verified.
+- Preserve feature-worktree, focused-Gitmoji-commit, and explicit-approval-before-merge workflow.
+
+## Workflow
+
+1. Inspect the diff against `main`, the affected contract, decisions, and tests.
+2. Check privacy: validated Auth0 identity, owner-scoped access, `404` privacy behavior, DTO validation, and two-user coverage where backend behavior changed.
+3. Check frontend behavior: mobile route access and drawer close/dismiss flow, Public Sans availability, approved tokens, visible focus, keyboard navigation, shared loading/empty/error states, and inactive or no-op controls.
+4. Check API and documentation alignment, including collection deletion behavior and exact endpoint/error claims.
+5. Run the narrowest relevant test first, then only the non-mutating lint commands below, typecheck, relevant unit or E2E suites, and build.
+6. Return findings ordered by severity with file and line evidence, followed by exact passed, failed, and skipped command outcomes.
+
+## Commands
+
+```bash
+git diff main...HEAD --check
+bun --cwd frontend lint
+bun --cwd backend x eslint "{src,apps,libs,test}/**/*.ts"
+bun run typecheck
+bun run test
+bun run test:e2e
+bun run build
+```
+
+Run only relevant commands after the narrowest affected test, and mark unavailable or inapplicable commands as skipped with a reason.
+
+## Definition of done
+
+The review remains read-only, identifies only actionable findings with evidence, covers privacy and mobile/accessibility risks, checks documentation alignment, and records every verification command outcome exactly.
diff --git a/TASKS.md b/TASKS.md
index 5950cad..a02b3f8 100644
--- a/TASKS.md
+++ b/TASKS.md
@@ -18,21 +18,21 @@ Legend: `[x]` complete, `[ ]` not started, `[-]` in progress or needs verificati
 - [x] `docs/submission-evidence`
 
 ## Project setup
 
 - [x] Create `AGENTS.md` with project rules, target structure, commands, and workflow
 - [x] Initialize root Bun workspace (defer `bun install` and `bun.lock` until frontend and backend exist)
 - [x] Create NestJS backend in `backend/`
 - [x] Create Vite React frontend in `frontend/`
 - [x] Add root scripts for dev, lint, typecheck, test, E2E test, and build
 - [x] Create `.env.example` files without secrets
-- [ ] Add `.agent/` reusable agent capability
+- [x] Add `.agent/` reusable agent capability
 
 ## API specification and decisions
 
 - [x] Inspect Auth0 discovery document and JWKS
 - [x] Decide which Bearer token the API accepts and document the security rationale
 - [x] Create `API_DESIGN.md`
 - [x] Define `/me` API contract
 - [x] Define Collections CRUD API contract
 - [x] Define Bookmarks CRUD and filtering API contract
 - [x] Define `GET /collections/:id/bookmarks` contract
diff --git a/frontend/index.html b/frontend/index.html
index 0fca6f0..10624ca 100644
--- a/frontend/index.html
+++ b/frontend/index.html
@@ -1,13 +1,16 @@
 <!doctype html>
 <html lang="en">
   <head>
     <meta charset="UTF-8" />
     <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
-    <title>frontend</title>
+    <link rel="preconnect" href="https://fonts.googleapis.com" />
+    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
+    <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
+    <title>Private Bookmark Manager</title>
   </head>
   <body>
     <div id="root"></div>
     <script type="module" src="/src/main.tsx"></script>
   </body>
 </html>
diff --git a/frontend/src/App.test.tsx b/frontend/src/App.test.tsx
index 28026cf..5ce5848 100644
--- a/frontend/src/App.test.tsx
+++ b/frontend/src/App.test.tsx
@@ -1,25 +1,69 @@
-import { render, screen } from '@testing-library/react'
-import { expect, it, vi } from 'vitest'
+import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
+import { afterEach, expect, it, vi } from 'vitest'
 import App from './App'
 
 vi.mock('@auth0/auth0-react', () => ({
   useAuth0: () => ({
     isLoading: false,
     isAuthenticated: true,
     getAccessTokenSilently: vi.fn().mockResolvedValue('access-token'),
     user: { name: 'Candidate' },
     logout: vi.fn(),
   }),
 }))
 
 vi.mock('./lib/api-client', () => ({
   createApiClient: () => ({ get: vi.fn().mockResolvedValue([]) }),
 }))
 
+afterEach(cleanup)
+
 it('renders the shell heading and primary navigation after API access is verified', async () => {
   render(<App />)
 
   expect(await screen.findByRole('heading', { name: 'Private Bookmark Manager' })).toBeVisible()
   expect(screen.getByRole('link', { name: 'Collections' })).toBeVisible()
   expect(screen.getByRole('link', { name: 'Bookmarks' })).toBeVisible()
 })
+
+it('opens mobile navigation with all application routes and closes it with the close button', async () => {
+  render(<App />)
+  await screen.findByRole('heading', { name: 'Private Bookmark Manager' })
+
+  fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
+
+  const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile navigation' })
+  expect(within(mobileNavigation).getByRole('link', { name: 'All bookmarks' })).toBeVisible()
+  expect(within(mobileNavigation).getByRole('link', { name: 'Collections' })).toBeVisible()
+  expect(within(mobileNavigation).getByRole('link', { name: 'Bookmarks' })).toBeVisible()
+
+  fireEvent.click(screen.getByRole('button', { name: 'Close navigation' }))
+
+  await waitFor(() => expect(screen.queryByRole('button', { name: 'Close navigation' })).not.toBeInTheDocument())
+})
+
+it('closes mobile navigation after choosing All bookmarks', async () => {
+  render(<App />)
+  await screen.findByRole('heading', { name: 'Private Bookmark Manager' })
+
+  fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
+  fireEvent.click(screen.getAllByRole('link', { name: 'All bookmarks' }).at(-1)!)
+
+  await waitFor(() => expect(screen.queryByRole('button', { name: 'Close navigation' })).not.toBeInTheDocument())
+})
+
+it('styles both mobile navigation controls in MUI keyboard-focus state', async () => {
+  render(<App />)
+  await screen.findByRole('heading', { name: 'Private Bookmark Manager' })
+
+  const openNavigation = screen.getByRole('button', { name: 'Open navigation' })
+  openNavigation.classList.add('Mui-focusVisible')
+
+  expect(openNavigation).toHaveStyle({ outline: '3px solid #FF6E00', outlineOffset: '2px' })
+
+  fireEvent.click(openNavigation)
+  const closeNavigation = screen.getByRole('button', { name: 'Close navigation' })
+  closeNavigation.classList.add('Mui-focusVisible')
+
+  expect(closeNavigation).toHaveStyle({ outline: '3px solid #FF6E00', outlineOffset: '2px' })
+})
diff --git a/frontend/src/App.tsx b/frontend/src/App.tsx
index 985e71d..dbe49d6 100644
--- a/frontend/src/App.tsx
+++ b/frontend/src/App.tsx
@@ -1,46 +1,24 @@
-import { CssBaseline, ThemeProvider, createTheme } from "@mui/material"
+import { CssBaseline, ThemeProvider } from "@mui/material"
 import { BrowserRouter, Navigate, Route, Routes } from "react-router"
 
 import AuthGate from "./auth/AuthGate"
 import AppShell from "./layout/AppShell"
 import AllBookmarksPage from "./routes/AllBookmarksPage"
 import BookmarksPage from "./routes/BookmarksPage"
 import CallbackPage from "./routes/CallbackPage"
 import CollectionsPage from "./routes/CollectionsPage"
-
-const theme = createTheme({
-  palette: {
-    primary: { main: "#003399", dark: "#002570" },
-    secondary: { main: "#FF6E00", dark: "#CC5800" },
-    text: { primary: "#3F3F3F", secondary: "#666666" },
-    background: { default: "#F7F8FC", paper: "#FFFFFF" },
-    divider: "#E5E7EB",
-    error: { main: "#C62828" },
-    success: { main: "#2E7D32" },
-  },
-  shape: { borderRadius: 10 },
-  spacing: 8,
-  typography: {
-    fontFamily: '"Source Sans 3", sans-serif',
-    h4: {
-      fontFamily: "Manrope, sans-serif",
-      fontSize: "1.75rem",
-      fontWeight: 700,
-      lineHeight: "2.25rem",
-    },
-  },
-})
+import { appTheme } from "./theme"
 
 export default function App() {
   return (
-    <ThemeProvider theme={theme}>
+    <ThemeProvider theme={appTheme}>
       <CssBaseline />
       <AuthGate>
         <BrowserRouter>
           <Routes>
             <Route element={<AppShell />}>
               <Route index element={<Navigate replace to="/collections" />} />
               <Route path="all" element={<AllBookmarksPage />} />
               <Route path="collections" element={<CollectionsPage />} />
               <Route path="bookmarks" element={<BookmarksPage />} />
             </Route>
diff --git a/frontend/src/features/bookmarks/BookmarkCard.test.tsx b/frontend/src/features/bookmarks/BookmarkCard.test.tsx
index 86220e0..2118d86 100644
--- a/frontend/src/features/bookmarks/BookmarkCard.test.tsx
+++ b/frontend/src/features/bookmarks/BookmarkCard.test.tsx
@@ -9,17 +9,27 @@ afterEach(cleanup)
 
 it('opens the bookmark from its card action area in a new tab safely', () => {
   render(<BookmarkCard bookmark={bookmark} collectionName="Design" onDelete={vi.fn()} />)
 
   const link = screen.getByRole('link', { name: /mui/i })
   expect(link).toHaveAttribute('href', 'https://mui.com')
   expect(link).toHaveAttribute('target', '_blank')
   expect(link).toHaveAttribute('rel', 'noreferrer')
 })
 
+it('labels its branded fallback visual without taking keyboard focus from the external link', () => {
+  render(<BookmarkCard bookmark={bookmark} collectionName="Design" onDelete={vi.fn()} />)
+
+  expect(screen.getByRole('img', { name: 'Bookmark preview for MUI' })).toBeVisible()
+
+  const link = screen.getByRole('link', { name: /mui/i })
+  link.focus()
+  expect(link).toHaveFocus()
+})
+
 it('passes its bookmark to the delete action', () => {
   const onDelete = vi.fn()
   render(<BookmarkCard bookmark={bookmark} collectionName="Design" onDelete={onDelete} />)
 
   fireEvent.click(screen.getByRole('button', { name: 'Delete bookmark' }))
   expect(onDelete).toHaveBeenCalledWith(bookmark)
 })
diff --git a/frontend/src/features/bookmarks/BookmarkCard.tsx b/frontend/src/features/bookmarks/BookmarkCard.tsx
index fc63391..14db2b8 100644
--- a/frontend/src/features/bookmarks/BookmarkCard.tsx
+++ b/frontend/src/features/bookmarks/BookmarkCard.tsx
@@ -1,15 +1,15 @@
 import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
 import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
 import { Box, Card, CardActionArea, CardActions, CardContent, Chip, IconButton, Typography } from '@mui/material'
 
 import type { Bookmark } from './types'
 
 export default function BookmarkCard({ bookmark, collectionName, onDelete }: { bookmark: Bookmark; collectionName: string; onDelete: (bookmark: Bookmark) => void }) {
   return <Card variant="outlined">
-    <CardActionArea component="a" href={bookmark.url} rel="noreferrer" target="_blank">
-      <Box sx={{ alignItems: 'center', aspectRatio: '16 / 9', background: 'linear-gradient(135deg, #003399, #FF6E00)', color: 'common.white', display: 'flex', justifyContent: 'center' }}><BookmarkBorderIcon fontSize="large" /></Box>
-      <CardContent><Typography noWrap sx={{ fontWeight: 700 }}>{bookmark.title}</Typography><Typography color="text.secondary" noWrap variant="body2">{new URL(bookmark.url).hostname}</Typography>{bookmark.notes && <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">{bookmark.notes}</Typography>}</CardContent>
+    <CardActionArea component="a" href={bookmark.url} rel="noreferrer" sx={{ '&.Mui-focusVisible': { outline: '3px solid #FF6E00', outlineOffset: -3 } }} target="_blank">
+      <Box aria-label={`Bookmark preview for ${bookmark.title}`} role="img" sx={{ alignItems: 'center', aspectRatio: '16 / 9', background: 'linear-gradient(135deg, #003399, #FF6E00)', color: 'common.white', display: 'flex', justifyContent: 'center' }}><BookmarkBorderIcon fontSize="large" /></Box>
+      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}><Typography noWrap sx={{ fontWeight: 700 }}>{bookmark.title}</Typography><Typography color="text.secondary" noWrap variant="body2">{new URL(bookmark.url).hostname}</Typography>{bookmark.notes && <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">{bookmark.notes}</Typography>}</CardContent>
     </CardActionArea>
-    <CardActions sx={{ justifyContent: 'space-between' }}><Chip label={collectionName} size="small" /><IconButton aria-label="Delete bookmark" color="error" onClick={() => onDelete(bookmark)}><DeleteOutlinedIcon /></IconButton></CardActions>
+    <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}><Chip label={collectionName} size="small" /><IconButton aria-label="Delete bookmark" color="error" onClick={() => onDelete(bookmark)}><DeleteOutlinedIcon /></IconButton></CardActions>
   </Card>
 }
diff --git a/frontend/src/features/bookmarks/BookmarkDeleteDialog.test.tsx b/frontend/src/features/bookmarks/BookmarkDeleteDialog.test.tsx
new file mode 100644
index 0000000..5fbbdae
--- /dev/null
+++ b/frontend/src/features/bookmarks/BookmarkDeleteDialog.test.tsx
@@ -0,0 +1,34 @@
+import { fireEvent, render, screen } from '@testing-library/react'
+import { expect, it, vi } from 'vitest'
+
+import BookmarkDeleteDialog from './BookmarkDeleteDialog'
+
+const bookmark = {
+  id: 'bookmark-1',
+  title: 'MUI',
+  url: 'https://mui.com',
+  notes: null,
+  collectionId: null,
+  createdAt: '2026-07-29T00:00:00.000Z',
+  updatedAt: '2026-07-29T00:00:00.000Z',
+}
+
+it('calls the confirmation callback only after Delete is selected', () => {
+  const onConfirm = vi.fn()
+
+  render(<BookmarkDeleteDialog bookmark={bookmark} onCancel={vi.fn()} onConfirm={onConfirm} />)
+
+  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
+
+  expect(onConfirm).toHaveBeenCalledOnce()
+})
+
+it('calls the cancellation callback when Cancel is selected', () => {
+  const onCancel = vi.fn()
+
+  render(<BookmarkDeleteDialog bookmark={bookmark} onCancel={onCancel} onConfirm={vi.fn()} />)
+
+  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
+
+  expect(onCancel).toHaveBeenCalledOnce()
+})
diff --git a/frontend/src/features/bookmarks/BookmarkDeleteDialog.tsx b/frontend/src/features/bookmarks/BookmarkDeleteDialog.tsx
new file mode 100644
index 0000000..339e209
--- /dev/null
+++ b/frontend/src/features/bookmarks/BookmarkDeleteDialog.tsx
@@ -0,0 +1,22 @@
+import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
+
+import type { Bookmark } from './types'
+
+interface BookmarkDeleteDialogProps {
+  bookmark?: Bookmark
+  onCancel: () => void
+  onConfirm: () => void
+}
+
+export default function BookmarkDeleteDialog({ bookmark, onCancel, onConfirm }: BookmarkDeleteDialogProps) {
+  return (
+    <Dialog onClose={onCancel} open={Boolean(bookmark)}>
+      <DialogTitle>Delete bookmark?</DialogTitle>
+      <DialogContent>This cannot be undone.</DialogContent>
+      <DialogActions>
+        <Button onClick={onCancel}>Cancel</Button>
+        <Button color="error" onClick={onConfirm}>Delete</Button>
+      </DialogActions>
+    </Dialog>
+  )
+}
diff --git a/frontend/src/features/bookmarks/BookmarkSearchToolbar.test.tsx b/frontend/src/features/bookmarks/BookmarkSearchToolbar.test.tsx
new file mode 100644
index 0000000..53e7ea3
--- /dev/null
+++ b/frontend/src/features/bookmarks/BookmarkSearchToolbar.test.tsx
@@ -0,0 +1,19 @@
+import { cleanup, fireEvent, render, screen } from '@testing-library/react'
+import { afterEach, expect, it, vi } from 'vitest'
+
+import BookmarkSearchToolbar from './BookmarkSearchToolbar'
+
+afterEach(cleanup)
+
+it('passes the entered query and submits the search form', () => {
+  const onChange = vi.fn()
+  const onSubmit = vi.fn()
+
+  render(<BookmarkSearchToolbar onChange={onChange} onSubmit={onSubmit} value="" />)
+
+  fireEvent.change(screen.getByLabelText('Search bookmarks'), { target: { value: 'react' } })
+  fireEvent.submit(screen.getByRole('search'))
+
+  expect(onChange).toHaveBeenCalledWith('react')
+  expect(onSubmit).toHaveBeenCalledOnce()
+})
diff --git a/frontend/src/features/bookmarks/BookmarkSearchToolbar.tsx b/frontend/src/features/bookmarks/BookmarkSearchToolbar.tsx
new file mode 100644
index 0000000..4c84447
--- /dev/null
+++ b/frontend/src/features/bookmarks/BookmarkSearchToolbar.tsx
@@ -0,0 +1,37 @@
+import { Search } from '@mui/icons-material'
+import { Box, Button, Stack, TextField } from '@mui/material'
+import type { ReactNode } from 'react'
+
+interface BookmarkSearchToolbarProps {
+  children?: ReactNode
+  onChange: (value: string) => void
+  onSubmit: () => void
+  value: string
+}
+
+export default function BookmarkSearchToolbar({ children, onChange, onSubmit, value }: BookmarkSearchToolbarProps) {
+  return (
+    <Box
+      aria-label="Bookmark search"
+      component="form"
+      onSubmit={(event) => {
+        event.preventDefault()
+        onSubmit()
+      }}
+      role="search"
+    >
+      <Stack spacing={1.5}>
+        <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.5}>
+          <TextField
+            fullWidth
+            label="Search bookmarks"
+            onChange={(event) => onChange(event.target.value)}
+            value={value}
+          />
+          <Button startIcon={<Search />} type="submit" variant="contained">Search</Button>
+        </Stack>
+        {children}
+      </Stack>
+    </Box>
+  )
+}
diff --git a/frontend/src/layout/AppShell.tsx b/frontend/src/layout/AppShell.tsx
index d883975..998e107 100644
--- a/frontend/src/layout/AppShell.tsx
+++ b/frontend/src/layout/AppShell.tsx
@@ -1,36 +1,62 @@
 import { useAuth0 } from '@auth0/auth0-react'
 import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
+import CloseIcon from '@mui/icons-material/Close'
 import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
 import LogoutIcon from '@mui/icons-material/Logout'
-import { AppBar, Box, Button, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material'
+import MenuIcon from '@mui/icons-material/Menu'
+import { AppBar, Box, Button, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material'
 import { NavLink, Outlet } from 'react-router'
+import { useState } from 'react'
 
 const drawerWidth = 244
+const navigationIconButtonFocus = { outline: '3px solid #FF6E00', outlineOffset: 2 }
 
 const navigation = [
   { label: 'All bookmarks', to: '/all', icon: <BookmarkBorderIcon /> },
   { label: 'Collections', to: '/collections', icon: <FolderOutlinedIcon /> },
   { label: 'Bookmarks', to: '/bookmarks', icon: <BookmarkBorderIcon /> },
 ]
 
+function NavigationList({ onNavigate }: { onNavigate?: () => void }) {
+  return (
+    <List sx={{ px: 1 }}>
+      {navigation.map(({ label, to, icon }) => (
+        <ListItemButton component={NavLink} key={to} onClick={onNavigate} to={to} sx={{ borderRadius: 1.5, mb: 0.5, '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'inherit' } } }}>
+          <ListItemIcon>{icon}</ListItemIcon>
+          <ListItemText primary={label} />
+        </ListItemButton>
+      ))}
+    </List>
+  )
+}
+
 export default function AppShell() {
   const { user, logout } = useAuth0()
+  const [mobileOpen, setMobileOpen] = useState(false)
 
   return (
     <Box sx={{ display: 'flex', minHeight: '100vh' }}>
       <AppBar color="inherit" elevation={0} position="fixed" sx={{ borderBottom: 1, borderColor: 'divider', ml: { md: `${drawerWidth}px` }, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
-        <Toolbar sx={{ justifyContent: 'space-between' }}>
-          <Typography component="h1" variant="h6" sx={{ fontWeight: 700 }}>Private Bookmark Manager</Typography>
-          <Button color="inherit" endIcon={<LogoutIcon />} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>{user?.name ?? user?.email ?? 'Account'}</Button>
+        <Toolbar sx={{ gap: 1 }}>
+          <IconButton aria-label="Open navigation" color="inherit" onClick={() => setMobileOpen(true)} sx={{ '&.Mui-focusVisible': navigationIconButtonFocus, display: { xs: 'inline-flex', md: 'none' } }}>
+            <MenuIcon />
+          </IconButton>
+          <Typography component="h1" noWrap variant="h6" sx={{ flexGrow: 1, fontWeight: 700, minWidth: 0 }}>Private Bookmark Manager</Typography>
+          <Button color="inherit" endIcon={<LogoutIcon />} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} sx={{ flexShrink: 0, maxWidth: { xs: 120, sm: 'none' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name ?? user?.email ?? 'Account'}</Button>
         </Toolbar>
       </AppBar>
       <Drawer open sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} variant="permanent">
         <Toolbar><Typography color="primary" variant="h6">Bookmarks</Typography></Toolbar>
-        <List sx={{ px: 1 }}>
-          {navigation.map(({ label, to, icon }) => <ListItemButton component={NavLink} key={to} to={to} sx={{ borderRadius: 1.5, mb: 0.5, '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'inherit' } } }}><ListItemIcon>{icon}</ListItemIcon><ListItemText primary={label} /></ListItemButton>)}
-        </List>
+        <Box component="nav" aria-label="Desktop navigation"><NavigationList /></Box>
+      </Drawer>
+      <Drawer onClose={() => setMobileOpen(false)} open={mobileOpen} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} variant="temporary">
+        <Toolbar sx={{ justifyContent: 'space-between' }}>
+          <Typography color="primary" variant="h6">Bookmarks</Typography>
+          <IconButton aria-label="Close navigation" onClick={() => setMobileOpen(false)} sx={{ '&.Mui-focusVisible': navigationIconButtonFocus }}><CloseIcon /></IconButton>
+        </Toolbar>
+        <Box component="nav" aria-label="Mobile navigation"><NavigationList onNavigate={() => setMobileOpen(false)} /></Box>
       </Drawer>
       <Box component="main" sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` }, p: { xs: 2, md: 4 }, pt: { xs: 10, md: 12 } }}><Outlet /></Box>
     </Box>
   )
 }
diff --git a/frontend/src/routes/AllBookmarksPage.test.tsx b/frontend/src/routes/AllBookmarksPage.test.tsx
index 4b5dc25..d846edc 100644
--- a/frontend/src/routes/AllBookmarksPage.test.tsx
+++ b/frontend/src/routes/AllBookmarksPage.test.tsx
@@ -1,24 +1,25 @@
 import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
 import { afterEach, expect, it, vi } from 'vitest'
 import AllBookmarksPage from './AllBookmarksPage'
 
-const api = vi.hoisted(() => ({ get: vi.fn() }))
+const api = vi.hoisted(() => ({ delete: vi.fn(), get: vi.fn() }))
 
 vi.mock('@auth0/auth0-react', () => ({
   useAuth0: () => ({ getAccessTokenSilently: vi.fn().mockResolvedValue('access-token') }),
 }))
 
 vi.mock('../lib/api-client', () => ({ createApiClient: () => api }))
 
 afterEach(() => {
   cleanup()
+  api.delete.mockReset()
   api.get.mockReset()
 })
 
 it('groups bookmarks by collection and renders uncategorised bookmarks', async () => {
   api.get
     .mockResolvedValueOnce([
       { id: 'collection-1', name: 'Design' },
       { id: 'collection-2', name: 'Engineering' },
     ])
     .mockResolvedValueOnce([
@@ -50,20 +51,52 @@ it('shows a search-aware empty state when no bookmarks match', async () => {
   api.get.mockResolvedValue([])
   render(<AllBookmarksPage />)
 
   await screen.findByRole('heading', { name: 'All bookmarks' })
   fireEvent.change(screen.getByLabelText('Search bookmarks'), { target: { value: 'missing' } })
   fireEvent.submit(screen.getByRole('search'))
 
   expect(await screen.findByText('No bookmarks match your search.')).toBeVisible()
 })
 
+it('deletes a bookmark after confirmation and removes its card', async () => {
+  api.get
+    .mockResolvedValueOnce([{ id: 'collection-1', name: 'Design' }])
+    .mockResolvedValueOnce([bookmark({ id: 'bookmark-1', collectionId: 'collection-1', title: 'MUI' })])
+  api.delete.mockResolvedValueOnce(undefined)
+
+  render(<AllBookmarksPage />)
+
+  fireEvent.click(await screen.findByRole('button', { name: 'Delete bookmark' }))
+  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
+
+  await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/bookmarks/bookmark-1'))
+  expect(screen.queryByRole('link', { name: /MUI/i })).not.toBeInTheDocument()
+})
+
+it('keeps the bookmark when deletion fails and shows a safe non-retryable error', async () => {
+  api.get
+    .mockResolvedValueOnce([{ id: 'collection-1', name: 'Design' }])
+    .mockResolvedValueOnce([bookmark({ id: 'bookmark-1', collectionId: 'collection-1', title: 'MUI' })])
+  api.delete.mockRejectedValueOnce(new Error('Internal SQL error: ownerId=auth0|victim'))
+
+  render(<AllBookmarksPage />)
+
+  fireEvent.click(await screen.findByRole('button', { name: 'Delete bookmark' }))
+  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
+
+  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to delete bookmark')
+  expect(screen.queryByText('Internal SQL error: ownerId=auth0|victim')).not.toBeInTheDocument()
+  expect(screen.getByRole('link', { name: /MUI/i })).toBeInTheDocument()
+  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
+})
+
 function bookmark(overrides: Partial<{ id: string; collectionId: string | null; title: string }> = {}) {
   return {
     id: 'bookmark-default',
     title: 'Bookmark',
     url: 'https://example.com',
     notes: null,
     collectionId: null,
     createdAt: '2026-07-29T00:00:00.000Z',
     updatedAt: '2026-07-29T00:00:00.000Z',
     ...overrides,
diff --git a/frontend/src/routes/AllBookmarksPage.tsx b/frontend/src/routes/AllBookmarksPage.tsx
index 8df913f..527b97e 100644
--- a/frontend/src/routes/AllBookmarksPage.tsx
+++ b/frontend/src/routes/AllBookmarksPage.tsx
@@ -1,47 +1,49 @@
 import { useAuth0 } from '@auth0/auth0-react'
-import { Search } from '@mui/icons-material'
-import { Box, Button, Stack, TextField, Typography } from '@mui/material'
+import { Box, Stack, Typography } from '@mui/material'
 import { useCallback, useEffect, useMemo, useState } from 'react'
 
 import EmptyState from '../components/states/EmptyState'
 import ErrorState from '../components/states/ErrorState'
 import LoadingState from '../components/states/LoadingState'
 import BookmarkCardGrid from '../features/bookmarks/BookmarkCardGrid'
+import BookmarkDeleteDialog from '../features/bookmarks/BookmarkDeleteDialog'
+import BookmarkSearchToolbar from '../features/bookmarks/BookmarkSearchToolbar'
 import type { Bookmark, CollectionOption } from '../features/bookmarks/types'
 import { createApiClient } from '../lib/api-client'
 
 export default function AllBookmarksPage() {
   const { getAccessTokenSilently } = useAuth0()
   const api = useMemo(() => createApiClient(() => getAccessTokenSilently()), [getAccessTokenSilently])
   const [items, setItems] = useState<Bookmark[]>([])
   const [collections, setCollections] = useState<CollectionOption[]>([])
   const [search, setSearch] = useState('')
   const [submittedSearch, setSubmittedSearch] = useState('')
+  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark>()
   const [loading, setLoading] = useState(true)
-  const [error, setError] = useState<string>()
+  const [error, setError] = useState<{ message: string; retry: boolean }>()
 
   const load = useCallback(async () => {
     setLoading(true)
     setError(undefined)
 
     try {
       const query = submittedSearch.trim()
       const bookmarkPath = query ? `/bookmarks?q=${encodeURIComponent(query)}` : '/bookmarks'
       const [nextCollections, nextItems] = await Promise.all([
         api.get<CollectionOption[]>('/collections'),
         api.get<Bookmark[]>(bookmarkPath),
       ])
       setCollections(nextCollections)
       setItems(nextItems)
     } catch (cause) {
-      setError(cause instanceof Error ? cause.message : 'Unable to load bookmarks')
+      setError({ message: cause instanceof Error ? cause.message : 'Unable to load bookmarks', retry: true })
     } finally {
       setLoading(false)
     }
   }, [api, submittedSearch])
 
   useEffect(() => {
     void load()
   }, [load])
 
   const collectionNameById = useMemo(
@@ -49,64 +51,66 @@ export default function AllBookmarksPage() {
     [collections],
   )
   const groups = useMemo(
     () => collections
       .map((collection) => ({ collection, items: items.filter((item) => item.collectionId === collection.id) }))
       .filter((group) => group.items.length > 0),
     [collections, items],
   )
   const uncategorised = useMemo(() => items.filter((item) => item.collectionId === null), [items])
 
+  const remove = async () => {
+    if (!bookmarkToDelete) return
+
+    try {
+      await api.delete(`/bookmarks/${bookmarkToDelete.id}`)
+      setItems((current) => current.filter((item) => item.id !== bookmarkToDelete.id))
+      setBookmarkToDelete(undefined)
+    } catch {
+      setError({ message: 'Unable to delete bookmark', retry: false })
+      setBookmarkToDelete(undefined)
+    }
+  }
+
   if (loading) return <LoadingState label="Loading all bookmarks" />
 
   return (
     <Stack spacing={3}>
       <Box>
         <Typography component="h2" variant="h4">All bookmarks</Typography>
         <Typography color="text.secondary">Browse every saved link by collection.</Typography>
       </Box>
 
-      {error && <ErrorState message={error} onRetry={() => void load()} />}
+      {error && <ErrorState message={error.message} onRetry={error.retry ? () => void load() : undefined} />}
 
-      <Box
-        component="form"
-        onSubmit={(event) => {
-          event.preventDefault()
-          setSubmittedSearch(search)
-        }}
-        role="search"
-      >
-        <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.5}>
-          <TextField
-            fullWidth
-            label="Search bookmarks"
-            onChange={(event) => setSearch(event.target.value)}
-            value={search}
-          />
-          <Button startIcon={<Search />} type="submit" variant="contained">Search</Button>
-        </Stack>
-      </Box>
+      <BookmarkSearchToolbar onChange={setSearch} onSubmit={() => setSubmittedSearch(search)} value={search} />
 
       {items.length === 0 ? (
         <EmptyState
           description={submittedSearch.trim() ? 'No bookmarks match your search.' : 'Save a link to start your bookmark library.'}
           title={submittedSearch.trim() ? 'No matching bookmarks' : 'No bookmarks yet'}
         />
       ) : (
         <Stack spacing={4}>
           {groups.map(({ collection, items: groupItems }) => (
             <Stack component="section" key={collection.id} spacing={1.5}>
               <Typography component="h3" variant="h5">{collection.name}</Typography>
-              <BookmarkCardGrid collectionNameById={collectionNameById} items={groupItems} onDelete={() => undefined} />
+              <BookmarkCardGrid collectionNameById={collectionNameById} items={groupItems} onDelete={setBookmarkToDelete} />
             </Stack>
           ))}
           {uncategorised.length > 0 && (
             <Stack component="section" spacing={1.5}>
               <Typography component="h3" variant="h5">Uncategorised</Typography>
-              <BookmarkCardGrid collectionNameById={collectionNameById} items={uncategorised} onDelete={() => undefined} />
+              <BookmarkCardGrid collectionNameById={collectionNameById} items={uncategorised} onDelete={setBookmarkToDelete} />
             </Stack>
           )}
         </Stack>
       )}
+
+      <BookmarkDeleteDialog
+        bookmark={bookmarkToDelete}
+        onCancel={() => setBookmarkToDelete(undefined)}
+        onConfirm={() => void remove()}
+      />
     </Stack>
   )
 }
diff --git a/frontend/src/routes/BookmarksPage.test.tsx b/frontend/src/routes/BookmarksPage.test.tsx
index 39898e5..98d5b71 100644
--- a/frontend/src/routes/BookmarksPage.test.tsx
+++ b/frontend/src/routes/BookmarksPage.test.tsx
@@ -16,41 +16,73 @@ vi.mock('../lib/api-client', () => ({
   createApiClient: () => api,
 }))
 
 afterEach(() => {
   cleanup()
   api.delete.mockReset()
   api.get.mockReset()
   api.post.mockReset()
 })
 
-it('renders bookmarks as cards and opens their delete confirmation', async () => {
+it('deletes a bookmark after confirmation', async () => {
   api.get
     .mockResolvedValueOnce([
       {
         id: 'bookmark-1',
         title: 'MUI',
         url: 'https://mui.com',
         notes: null,
         collectionId: 'collection-1',
         createdAt: '2026-07-28T00:00:00.000Z',
         updatedAt: '2026-07-28T00:00:00.000Z',
       },
     ])
     .mockResolvedValueOnce([{ id: 'collection-1', name: 'Design' }])
+  api.delete.mockResolvedValueOnce(undefined)
 
   render(<BookmarksPage />)
 
   expect(await screen.findByRole('link', { name: /mui/i })).toHaveAttribute('href', 'https://mui.com')
   fireEvent.click(screen.getByRole('button', { name: 'Delete bookmark' }))
 
   expect(screen.getByRole('heading', { name: 'Delete bookmark?' })).toBeVisible()
+  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
+
+  await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/bookmarks/bookmark-1'))
+  expect(screen.queryByRole('link', { name: /MUI/i })).not.toBeInTheDocument()
+})
+
+it('keeps the bookmark and shows a safe error when deletion fails', async () => {
+  api.get
+    .mockResolvedValueOnce([
+      {
+        id: 'bookmark-1',
+        title: 'MUI',
+        url: 'https://mui.com',
+        notes: null,
+        collectionId: 'collection-1',
+        createdAt: '2026-07-28T00:00:00.000Z',
+        updatedAt: '2026-07-28T00:00:00.000Z',
+      },
+    ])
+    .mockResolvedValueOnce([{ id: 'collection-1', name: 'Design' }])
+  api.delete.mockRejectedValueOnce(new Error('Internal SQL error: ownerId=auth0|victim'))
+
+  render(<BookmarksPage />)
+
+  fireEvent.click(await screen.findByRole('button', { name: 'Delete bookmark' }))
+  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
+
+  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to delete bookmark')
+  expect(screen.queryByText('Internal SQL error: ownerId=auth0|victim')).not.toBeInTheDocument()
+  expect(screen.getByRole('link', { name: /MUI/i })).toBeInTheDocument()
+  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
 })
 
 it('retries a failed bookmark request', async () => {
   api.get
     .mockRejectedValueOnce(new Error('Network unavailable'))
     .mockResolvedValue([])
 
   render(<BookmarksPage />)
 
   expect(await screen.findByRole('alert')).toHaveTextContent('Network unavailable')
diff --git a/frontend/src/routes/BookmarksPage.tsx b/frontend/src/routes/BookmarksPage.tsx
index 6f1d075..428ba08 100644
--- a/frontend/src/routes/BookmarksPage.tsx
+++ b/frontend/src/routes/BookmarksPage.tsx
@@ -1,29 +1,27 @@
 import { useAuth0 } from '@auth0/auth0-react'
 import { Add } from '@mui/icons-material'
 import {
   Box,
   Button,
-  Dialog,
-  DialogActions,
-  DialogContent,
-  DialogTitle,
   MenuItem,
   Stack,
   TextField,
   Typography,
 } from '@mui/material'
 import { useEffect, useMemo, useState } from 'react'
 import ErrorState from '../components/states/ErrorState'
 import LoadingState from '../components/states/LoadingState'
 import BookmarkCardGrid from '../features/bookmarks/BookmarkCardGrid'
+import BookmarkDeleteDialog from '../features/bookmarks/BookmarkDeleteDialog'
 import BookmarkDialog from '../features/bookmarks/BookmarkDialog'
+import BookmarkSearchToolbar from '../features/bookmarks/BookmarkSearchToolbar'
 import type { Bookmark, CollectionOption } from '../features/bookmarks/types'
 import { createApiClient } from '../lib/api-client'
 
 export default function BookmarksPage() {
   const { getAccessTokenSilently } = useAuth0()
   const api = useMemo(() => createApiClient(() => getAccessTokenSilently()), [getAccessTokenSilently])
   const [items, setItems] = useState<Bookmark[]>([])
   const [collections, setCollections] = useState<CollectionOption[]>([])
   const [filter, setFilter] = useState('all')
   const [search, setSearch] = useState('')
@@ -80,22 +78,23 @@ export default function BookmarksPage() {
     }
   }
 
   const remove = async () => {
     if (!bookmarkToDelete) return
 
     try {
       await api.delete(`/bookmarks/${bookmarkToDelete.id}`)
       setItems((current) => current.filter((item) => item.id !== bookmarkToDelete.id))
       setBookmarkToDelete(undefined)
-    } catch (cause) {
-      setError({ message: cause instanceof Error ? cause.message : 'Unable to delete bookmark', retry: false })
+    } catch {
+      setError({ message: 'Unable to delete bookmark', retry: false })
+      setBookmarkToDelete(undefined)
     }
   }
 
   if (loading) {
     return <LoadingState label="Loading bookmarks" />
   }
 
   return (
     <Stack spacing={3}>
       <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
@@ -105,65 +104,43 @@ export default function BookmarksPage() {
           </Typography>
           <Typography color="text.secondary">Save links for later.</Typography>
         </Box>
         <Button onClick={() => setCreateOpen(true)} startIcon={<Add />} variant="contained">
           Create bookmark
         </Button>
       </Stack>
 
       {error && <ErrorState message={error.message} onRetry={error.retry ? () => void load() : undefined} />}
 
-      <Stack
-        component="form"
-        onSubmit={(event) => {
-          event.preventDefault()
-          setSubmittedSearch(search)
-        }}
-        role="search"
-        spacing={1.5}
-      >
-        <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.5}>
-          <TextField
-            fullWidth
-            label="Search bookmarks"
-            onChange={(event) => setSearch(event.target.value)}
-            value={search}
-          />
-          <Button type="submit" variant="contained">Search</Button>
-        </Stack>
+      <BookmarkSearchToolbar onChange={setSearch} onSubmit={() => setSubmittedSearch(search)} value={search}>
         <TextField label="Filter collection" onChange={(event) => setFilter(event.target.value)} select value={filter}>
           <MenuItem value="all">All bookmarks</MenuItem>
           <MenuItem value="none">Uncategorized</MenuItem>
           {collections.map((collection) => (
             <MenuItem key={collection.id} value={collection.id}>
               {collection.name}
             </MenuItem>
           ))}
         </TextField>
-      </Stack>
+      </BookmarkSearchToolbar>
 
       <BookmarkCardGrid
         collectionNameById={collectionNameById}
         items={items}
         onDelete={setBookmarkToDelete}
       />
 
       <BookmarkDialog
         collections={collections}
         onClose={() => setCreateOpen(false)}
         onSubmit={(value) => void create(value)}
         open={createOpen}
       />
 
-      <Dialog onClose={() => setBookmarkToDelete(undefined)} open={Boolean(bookmarkToDelete)}>
-        <DialogTitle>Delete bookmark?</DialogTitle>
-        <DialogContent>This cannot be undone.</DialogContent>
-        <DialogActions>
-          <Button onClick={() => setBookmarkToDelete(undefined)}>Cancel</Button>
-          <Button color="error" onClick={() => void remove()}>
-            Delete
-          </Button>
-        </DialogActions>
-      </Dialog>
+      <BookmarkDeleteDialog
+        bookmark={bookmarkToDelete}
+        onCancel={() => setBookmarkToDelete(undefined)}
+        onConfirm={() => void remove()}
+      />
     </Stack>
   )
 }
diff --git a/frontend/src/theme.ts b/frontend/src/theme.ts
new file mode 100644
index 0000000..c0e7327
--- /dev/null
+++ b/frontend/src/theme.ts
@@ -0,0 +1,71 @@
+import { createTheme, type Shadows, type Theme } from '@mui/material'
+
+const shadows: Shadows = Array.from({ length: 25 }, (_, index) => (
+  index === 0 ? 'none' : '0 4px 12px rgba(31, 41, 55, 0.08)'
+)) as Shadows
+
+export const appTheme: Theme = createTheme({
+  palette: {
+    background: { default: '#F7F8FC', paper: '#FFFFFF' },
+    divider: '#E5E7EB',
+    error: { main: '#C62828' },
+    primary: { dark: '#002570', main: '#003399' },
+    secondary: { dark: '#CC5800', main: '#FF6E00' },
+    success: { main: '#2E7D32' },
+    text: { primary: '#3F3F3F', secondary: '#666666' },
+  },
+  shape: { borderRadius: 12 },
+  shadows,
+  spacing: 8,
+  typography: {
+    fontFamily: '"Public Sans", sans-serif',
+    h4: { fontSize: '1.75rem', fontWeight: 700, lineHeight: '2.25rem' },
+    h5: { fontWeight: 700 },
+    h6: { fontWeight: 700 },
+  },
+  components: {
+    MuiButton: {
+      styleOverrides: {
+        root: {
+          borderRadius: 8,
+          boxShadow: 'none',
+          fontWeight: 700,
+          textTransform: 'none',
+          '&:focus-visible': { outline: '3px solid #FF6E00', outlineOffset: 2 },
+          '&:hover': { boxShadow: 'none' },
+        },
+      },
+    },
+    MuiCard: {
+      styleOverrides: {
+        root: {
+          border: '1px solid #E5E7EB',
+          boxShadow: '0 4px 12px rgba(31, 41, 55, 0.08)',
+          transition: 'box-shadow 160ms ease, transform 160ms ease',
+          '&:hover': { boxShadow: '0 8px 20px rgba(31, 41, 55, 0.12)', transform: 'translateY(-2px)' },
+        },
+      },
+    },
+    MuiChip: {
+      styleOverrides: {
+        root: { backgroundColor: '#EEF2FF', borderRadius: 8, color: '#003399', fontWeight: 600 },
+      },
+    },
+    MuiDrawer: {
+      styleOverrides: {
+        paper: { borderRight: '1px solid #E5E7EB', boxShadow: '0 8px 20px rgba(31, 41, 55, 0.08)' },
+      },
+    },
+    MuiTextField: {
+      styleOverrides: {
+        root: {
+          '& .MuiOutlinedInput-root': {
+            borderRadius: 8,
+            transition: 'box-shadow 160ms ease',
+            '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(255, 110, 0, 0.2)' },
+          },
+        },
+      },
+    },
+  },
+})

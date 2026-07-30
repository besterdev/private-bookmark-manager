### Task 2: Make hook dependencies match effect behavior

**Files:**
- Modify: `frontend/src/routes/BookmarksPage.tsx`
- Modify: `frontend/src/routes/CollectionsPage.tsx`
- Modify: `frontend/src/features/collections/CollectionDetail.tsx`
- Test: `frontend/src/routes/BookmarksPage.test.tsx`
- Test: `frontend/src/routes/CollectionsPage.test.tsx`
- Test: `frontend/src/features/collections/CollectionDetail.test.tsx`

**Interfaces:**
- Consumes: the existing `api`, filter/search state, `getBookmarks`, and `collection` props.
- Produces: unchanged requests and retries with no `react-hooks/exhaustive-deps` warnings.

- [ ] **Step 1: Capture the existing lint failure**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend lint
```

Expected: three `react-hooks/exhaustive-deps` warnings for `BookmarksPage`, `CollectionsPage`, and `CollectionDetail`.

- [ ] **Step 2: Write behavior-preserving tests before refactoring effects**

Add one rerender-based test per affected component:

```ts
// BookmarksPage: a submitted query triggers a request with q=react.
// CollectionsPage: retry triggers a second /collections request.
// CollectionDetail: changing collection id requests the new collection's bookmarks.
```

Each test must assert the real API path, for example:

```ts
expect(api.get).toHaveBeenCalledWith('/collections/collection-2/bookmarks')
```

- [ ] **Step 3: Run the affected tests and verify they pass before refactor**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/routes/BookmarksPage.test.tsx src/routes/CollectionsPage.test.tsx src/features/collections/CollectionDetail.test.tsx
```

Expected: PASS, proving the behavior to preserve.

- [ ] **Step 4: Stabilize callbacks and primitive dependencies**

In `BookmarksPage` and `CollectionsPage`, wrap `load` in `useCallback` and declare every value used by each request in its dependency array. Invoke it from an effect that depends on `load`:

```ts
const load = useCallback(async () => {
  // existing request and state transitions
}, [api, filter, submittedSearch])

useEffect(() => {
  void load()
}, [load])
```

In `CollectionDetail`, derive the primitive ID and use it throughout the effect:

```ts
const collectionId = collection?.id

useEffect(() => {
  if (!collectionId) return
  // existing request lifecycle using collectionId
}, [collectionId, getBookmarks, retry])
```

Do not use lint suppression comments or depend on the whole `collection` object.

- [ ] **Step 5: Verify behavior and clean lint**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/routes/BookmarksPage.test.tsx src/routes/CollectionsPage.test.tsx src/features/collections/CollectionDetail.test.tsx
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend lint
```

Expected: tests pass and lint exits with no warnings.

- [ ] **Step 6: Commit the hook corrections**

```bash
git add frontend/src/routes/BookmarksPage.tsx frontend/src/routes/BookmarksPage.test.tsx frontend/src/routes/CollectionsPage.tsx frontend/src/routes/CollectionsPage.test.tsx frontend/src/features/collections/CollectionDetail.tsx frontend/src/features/collections/CollectionDetail.test.tsx
git commit -m "🐛 fix: align frontend effect dependencies"
```


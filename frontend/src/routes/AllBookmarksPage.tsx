import { useAuth0 } from '@auth0/auth0-react'
import { Box, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'

import EmptyState from '../components/states/EmptyState'
import ErrorState from '../components/states/ErrorState'
import LoadingState from '../components/states/LoadingState'
import BookmarkCardGrid from '../features/bookmarks/BookmarkCardGrid'
import BookmarkDeleteDialog from '../features/bookmarks/BookmarkDeleteDialog'
import BookmarkSearchToolbar from '../features/bookmarks/BookmarkSearchToolbar'
import type { Bookmark, CollectionOption } from '../features/bookmarks/types'
import { createApiClient } from '../lib/api-client'

export default function AllBookmarksPage() {
  const { getAccessTokenSilently } = useAuth0()
  const api = useMemo(
    () => createApiClient(() => getAccessTokenSilently()),
    [getAccessTokenSilently],
  )
  const [items, setItems] = useState<Bookmark[]>([])
  const [collections, setCollections] = useState<CollectionOption[]>([])
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ message: string; retry: boolean }>()

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
    } catch {
      setError({ message: 'Unable to load bookmarks', retry: true })
    } finally {
      setLoading(false)
    }
  }, [api, submittedSearch])

  useEffect(() => {
    void load()
  }, [load])

  const collectionNameById = useMemo(
    () => Object.fromEntries(collections.map((collection) => [collection.id, collection.name])),
    [collections],
  )
  const groups = useMemo(
    () =>
      collections
        .map((collection) => ({
          collection,
          items: items.filter((item) => item.collectionId === collection.id),
        }))
        .filter((group) => group.items.length > 0),
    [collections, items],
  )
  const uncategorised = useMemo(() => items.filter((item) => item.collectionId === null), [items])

  const remove = async () => {
    if (!bookmarkToDelete) return

    setError(undefined)

    try {
      await api.delete(`/bookmarks/${bookmarkToDelete.id}`)
      setItems((current) => current.filter((item) => item.id !== bookmarkToDelete.id))
      setBookmarkToDelete(undefined)
    } catch {
      setError({ message: 'Unable to delete bookmark', retry: false })
      setBookmarkToDelete(undefined)
    }
  }

  if (loading) return <LoadingState label="Loading all bookmarks" />

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h2" variant="h4">
          All bookmarks
        </Typography>
        <Typography color="text.secondary">Browse every saved link by collection.</Typography>
      </Box>

      {error && (
        <ErrorState message={error.message} onRetry={error.retry ? () => void load() : undefined} />
      )}

      <BookmarkSearchToolbar
        onChange={setSearch}
        onSubmit={() => setSubmittedSearch(search)}
        value={search}
      />

      {items.length === 0 ? (
        <EmptyState
          description={
            submittedSearch.trim()
              ? 'No bookmarks match your search.'
              : 'Save a link to start your bookmark library.'
          }
          title={submittedSearch.trim() ? 'No matching bookmarks' : 'No bookmarks yet'}
        />
      ) : (
        <Stack spacing={4}>
          {groups.map(({ collection, items: groupItems }) => (
            <Stack component="section" key={collection.id} spacing={1.5}>
              <Typography component="h3" variant="h5">
                {collection.name}
              </Typography>
              <BookmarkCardGrid
                collectionNameById={collectionNameById}
                items={groupItems}
                onDelete={setBookmarkToDelete}
              />
            </Stack>
          ))}
          {uncategorised.length > 0 && (
            <Stack component="section" spacing={1.5}>
              <Typography component="h3" variant="h5">
                Uncategorised
              </Typography>
              <BookmarkCardGrid
                collectionNameById={collectionNameById}
                items={uncategorised}
                onDelete={setBookmarkToDelete}
              />
            </Stack>
          )}
        </Stack>
      )}

      <BookmarkDeleteDialog
        bookmark={bookmarkToDelete}
        onCancel={() => setBookmarkToDelete(undefined)}
        onConfirm={() => void remove()}
      />
    </Stack>
  )
}

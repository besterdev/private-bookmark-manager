import { useAuth0 } from '@auth0/auth0-react'
import { Search } from '@mui/icons-material'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'

import EmptyState from '../components/states/EmptyState'
import ErrorState from '../components/states/ErrorState'
import LoadingState from '../components/states/LoadingState'
import BookmarkCardGrid from '../features/bookmarks/BookmarkCardGrid'
import type { Bookmark, CollectionOption } from '../features/bookmarks/types'
import { createApiClient } from '../lib/api-client'

export default function AllBookmarksPage() {
  const { getAccessTokenSilently } = useAuth0()
  const api = useMemo(() => createApiClient(() => getAccessTokenSilently()), [getAccessTokenSilently])
  const [items, setItems] = useState<Bookmark[]>([])
  const [collections, setCollections] = useState<CollectionOption[]>([])
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

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
      setError(cause instanceof Error ? cause.message : 'Unable to load bookmarks')
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
    () => collections
      .map((collection) => ({ collection, items: items.filter((item) => item.collectionId === collection.id) }))
      .filter((group) => group.items.length > 0),
    [collections, items],
  )
  const uncategorised = useMemo(() => items.filter((item) => item.collectionId === null), [items])

  if (loading) return <LoadingState label="Loading all bookmarks" />

  return (
    <Stack spacing={3}>
      <Box>
        <Typography component="h2" variant="h4">All bookmarks</Typography>
        <Typography color="text.secondary">Browse every saved link by collection.</Typography>
      </Box>

      {error && <ErrorState message={error} onRetry={() => void load()} />}

      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault()
          setSubmittedSearch(search)
        }}
        role="search"
      >
        <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.5}>
          <TextField
            fullWidth
            label="Search bookmarks"
            onChange={(event) => setSearch(event.target.value)}
            value={search}
          />
          <Button startIcon={<Search />} type="submit" variant="contained">Search</Button>
        </Stack>
      </Box>

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
              <BookmarkCardGrid collectionNameById={collectionNameById} items={groupItems} onDelete={() => undefined} />
            </Stack>
          ))}
          {uncategorised.length > 0 && (
            <Stack component="section" spacing={1.5}>
              <Typography component="h3" variant="h5">Uncategorised</Typography>
              <BookmarkCardGrid collectionNameById={collectionNameById} items={uncategorised} onDelete={() => undefined} />
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  )
}

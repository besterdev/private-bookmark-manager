import { useAuth0 } from '@auth0/auth0-react'
import { Add } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import ErrorState from '../components/states/ErrorState'
import LoadingState from '../components/states/LoadingState'
import BookmarkCardGrid from '../features/bookmarks/BookmarkCardGrid'
import BookmarkDialog from '../features/bookmarks/BookmarkDialog'
import type { Bookmark, CollectionOption } from '../features/bookmarks/types'
import { createApiClient } from '../lib/api-client'

export default function BookmarksPage() {
  const { getAccessTokenSilently } = useAuth0()
  const api = useMemo(() => createApiClient(() => getAccessTokenSilently()), [getAccessTokenSilently])
  const [items, setItems] = useState<Bookmark[]>([])
  const [collections, setCollections] = useState<CollectionOption[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ message: string; retry: boolean }>()
  const [createOpen, setCreateOpen] = useState(false)

  const collectionNameById = useMemo(
    () => Object.fromEntries(collections.map((collection) => [collection.id, collection.name])),
    [collections],
  )

  const load = async () => {
    setLoading(true)
    setError(undefined)

    try {
      const params = new URLSearchParams()
      if (filter !== 'all' && filter !== 'none') params.set('collectionId', filter)
      const query = submittedSearch.trim()
      if (query) params.set('q', query)
      const bookmarkPath = params.size > 0 ? `/bookmarks?${params.toString()}` : '/bookmarks'
      const [next, options] = await Promise.all([
        api.get<Bookmark[]>(bookmarkPath),
        api.get<CollectionOption[]>('/collections'),
      ])
      setCollections(options)
      setItems(filter === 'none' ? next.filter((item) => !item.collectionId) : next)
    } catch (cause) {
      setError({ message: cause instanceof Error ? cause.message : 'Unable to load bookmarks', retry: true })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [api, filter, submittedSearch])

  const create = async (value: {
    title: string
    url: string
    notes?: string
    collectionId?: string | null
  }) => {
    try {
      const item = await api.post<Bookmark>('/bookmarks', value)
      setItems((current) => [item, ...current])
      setCreateOpen(false)
    } catch (cause) {
      setError({ message: cause instanceof Error ? cause.message : 'Unable to create bookmark', retry: false })
    }
  }

  const remove = async () => {
    if (!bookmarkToDelete) return

    try {
      await api.delete(`/bookmarks/${bookmarkToDelete.id}`)
      setItems((current) => current.filter((item) => item.id !== bookmarkToDelete.id))
      setBookmarkToDelete(undefined)
    } catch (cause) {
      setError({ message: cause instanceof Error ? cause.message : 'Unable to delete bookmark', retry: false })
    }
  }

  if (loading) {
    return <LoadingState label="Loading bookmarks" />
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Typography component="h2" variant="h4">
            Bookmarks
          </Typography>
          <Typography color="text.secondary">Save links for later.</Typography>
        </Box>
        <Button onClick={() => setCreateOpen(true)} startIcon={<Add />} variant="contained">
          Create bookmark
        </Button>
      </Stack>

      {error && <ErrorState message={error.message} onRetry={error.retry ? () => void load() : undefined} />}

      <Stack
        component="form"
        onSubmit={(event) => {
          event.preventDefault()
          setSubmittedSearch(search)
        }}
        role="search"
        spacing={1.5}
      >
        <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.5}>
          <TextField
            fullWidth
            label="Search bookmarks"
            onChange={(event) => setSearch(event.target.value)}
            value={search}
          />
          <Button type="submit" variant="contained">Search</Button>
        </Stack>
        <TextField label="Filter collection" onChange={(event) => setFilter(event.target.value)} select value={filter}>
          <MenuItem value="all">All bookmarks</MenuItem>
          <MenuItem value="none">Uncategorized</MenuItem>
          {collections.map((collection) => (
            <MenuItem key={collection.id} value={collection.id}>
              {collection.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

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

      <Dialog onClose={() => setBookmarkToDelete(undefined)} open={Boolean(bookmarkToDelete)}>
        <DialogTitle>Delete bookmark?</DialogTitle>
        <DialogContent>This cannot be undone.</DialogContent>
        <DialogActions>
          <Button onClick={() => setBookmarkToDelete(undefined)}>Cancel</Button>
          <Button color="error" onClick={() => void remove()}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

import { useAuth0 } from '@auth0/auth0-react'
import { Add } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const collectionNameById = useMemo(
    () => Object.fromEntries(collections.map((collection) => [collection.id, collection.name])),
    [collections],
  )

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const [next, options] = await Promise.all([
        api.get<Bookmark[]>(
          filter === 'all' || filter === 'none' ? '/bookmarks' : `/bookmarks?collectionId=${filter}`,
        ),
        api.get<CollectionOption[]>('/collections'),
      ])
      setCollections(options)
      setItems(filter === 'none' ? next.filter((item) => !item.collectionId) : next)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load bookmarks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [api, filter])

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
      setError(cause instanceof Error ? cause.message : 'Unable to create bookmark')
    }
  }

  const remove = async () => {
    if (!bookmarkToDelete) return

    try {
      await api.delete(`/bookmarks/${bookmarkToDelete.id}`)
      setItems((current) => current.filter((item) => item.id !== bookmarkToDelete.id))
      setBookmarkToDelete(undefined)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete bookmark')
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'grid', minHeight: 240, placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
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

      {error && <Alert severity="error">{error}</Alert>}

      <TextField label="Filter collection" onChange={(event) => setFilter(event.target.value)} select value={filter}>
        <MenuItem value="all">All bookmarks</MenuItem>
        <MenuItem value="none">Uncategorized</MenuItem>
        {collections.map((collection) => (
          <MenuItem key={collection.id} value={collection.id}>
            {collection.name}
          </MenuItem>
        ))}
      </TextField>

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

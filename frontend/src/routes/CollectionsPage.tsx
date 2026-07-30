import { useAuth0 } from '@auth0/auth0-react'
import { Add } from '@mui/icons-material'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'

import EmptyState from '../components/states/EmptyState'
import ErrorState from '../components/states/ErrorState'
import LoadingState from '../components/states/LoadingState'
import type { Bookmark } from '../features/bookmarks/types'
import CollectionDetail from '../features/collections/CollectionDetail'
import CollectionDialog from '../features/collections/CollectionDialog'
import CollectionList from '../features/collections/CollectionList'
import type { Collection } from '../features/collections/types'
import { createApiClient } from '../lib/api-client'

export default function CollectionsPage() {
  const { getAccessTokenSilently } = useAuth0()
  const api = useMemo(() => createApiClient(() => getAccessTokenSilently()), [getAccessTokenSilently])
  const getBookmarks = useCallback((collectionId: string) => api.get<Bookmark[]>(`/collections/${collectionId}/bookmarks`), [api])
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedId, setSelectedId] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ message: string; retry: boolean }>()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const selected = collections.find((collection) => collection.id === selectedId)
  const load = useCallback(async () => { setLoading(true); setError(undefined); try { const data = await api.get<Collection[]>('/collections'); setCollections(data); setSelectedId((id) => id && data.some((item) => item.id === id) ? id : data[0]?.id) } catch { setError({ message: 'Unable to load collections', retry: true }) } finally { setLoading(false) } }, [api])
  useEffect(() => { void load() }, [load])
  const create = async (name: string) => { try { const collection = await api.post<Collection>('/collections', { name }); setCollections((items) => [collection, ...items]); setSelectedId(collection.id); setCreateOpen(false) } catch { setError({ message: 'Unable to create collection', retry: false }) } }
  const remove = async () => { if (!selected) return; try { await api.delete(`/collections/${selected.id}`); setCollections((items) => { const next = items.filter((item) => item.id !== selected.id); setSelectedId(next[0]?.id); return next }); setDeleteOpen(false) } catch { setError({ message: 'Unable to delete collection', retry: false }) } }

  if (loading) return <LoadingState label="Loading collections" />
  return <Stack spacing={3}><Stack direction="row" sx={{ justifyContent: 'space-between' }}><Box><Typography component="h2" variant="h4">Collections</Typography><Typography color="text.secondary">Organize your private bookmarks.</Typography></Box><Button onClick={() => setCreateOpen(true)} startIcon={<Add />} variant="contained">Create collection</Button></Stack>{error && <ErrorState message={error.message} onRetry={error.retry ? () => void load() : undefined} />}{collections.length === 0 ? <EmptyState actionLabel="Create collection" description="Create a collection to organize your bookmarks." onAction={() => setCreateOpen(true)} title="No collections yet" /> : <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { md: 'minmax(240px, 0.8fr) minmax(0, 1.7fr)' } }}><CollectionList collections={collections} onSelect={setSelectedId} selectedId={selectedId} /><CollectionDetail collection={selected} getBookmarks={getBookmarks} onDelete={() => setDeleteOpen(true)} /></Box>}<CollectionDialog onClose={() => setCreateOpen(false)} onSubmit={(name) => void create(name)} open={createOpen} /><Dialog onClose={() => setDeleteOpen(false)} open={deleteOpen}><DialogTitle>Delete collection?</DialogTitle><DialogContent>This keeps its bookmarks, but makes them uncategorized.</DialogContent><DialogActions><Button onClick={() => setDeleteOpen(false)}>Cancel</Button><Button color="error" onClick={() => void remove()}>Delete</Button></DialogActions></Dialog></Stack>
}

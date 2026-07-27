import { useAuth0 } from '@auth0/auth0-react'
import { Add, Refresh } from '@mui/icons-material'
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import CollectionDetail from '../features/collections/CollectionDetail'
import CollectionDialog from '../features/collections/CollectionDialog'
import CollectionList from '../features/collections/CollectionList'
import type { Collection } from '../features/collections/types'
import { createApiClient } from '../lib/api-client'

export default function CollectionsPage() {
  const { getAccessTokenSilently } = useAuth0()
  const api = useMemo(() => createApiClient(() => getAccessTokenSilently()), [getAccessTokenSilently])
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedId, setSelectedId] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const selected = collections.find((collection) => collection.id === selectedId)
  const load = async () => { setLoading(true); setError(''); try { const data = await api.get<Collection[]>('/collections'); setCollections(data); setSelectedId((id) => id && data.some((item) => item.id === id) ? id : data[0]?.id) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load collections') } finally { setLoading(false) } }
  useEffect(() => { void load() }, [api])
  const create = async (name: string) => { try { const collection = await api.post<Collection>('/collections', { name }); setCollections((items) => [collection, ...items]); setSelectedId(collection.id); setCreateOpen(false) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to create collection') } }
  const remove = async () => { if (!selected) return; try { await api.delete(`/collections/${selected.id}`); setCollections((items) => { const next = items.filter((item) => item.id !== selected.id); setSelectedId(next[0]?.id); return next }); setDeleteOpen(false) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to delete collection') } }

  if (loading) return <Box sx={{ display: 'grid', minHeight: 240, placeItems: 'center' }}><CircularProgress /></Box>
  return <Stack spacing={3}><Stack direction="row" sx={{ justifyContent: 'space-between' }}><Box><Typography component="h2" variant="h4">Collections</Typography><Typography color="text.secondary">Organize your private bookmarks.</Typography></Box><Button onClick={() => setCreateOpen(true)} startIcon={<Add />} variant="contained">Create collection</Button></Stack>{error && <Alert action={<Button onClick={() => void load()} size="small" startIcon={<Refresh />}>Retry</Button>} severity="error">{error}</Alert>}{collections.length === 0 ? <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 5, textAlign: 'center' }}><Typography variant="h6">No collections yet</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Create a collection to organize your bookmarks.</Typography><Button onClick={() => setCreateOpen(true)} variant="contained">Create collection</Button></Box> : <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { md: 'minmax(240px, 0.8fr) minmax(0, 1.7fr)' } }}><CollectionList collections={collections} onSelect={setSelectedId} selectedId={selectedId} /><CollectionDetail collection={selected} onDelete={() => setDeleteOpen(true)} /></Box>}<CollectionDialog onClose={() => setCreateOpen(false)} onSubmit={(name) => void create(name)} open={createOpen} /><Dialog onClose={() => setDeleteOpen(false)} open={deleteOpen}><DialogTitle>Delete collection?</DialogTitle><DialogContent>This keeps its bookmarks, but makes them uncategorized.</DialogContent><DialogActions><Button onClick={() => setDeleteOpen(false)}>Cancel</Button><Button color="error" onClick={() => void remove()}>Delete</Button></DialogActions></Dialog></Stack>
}

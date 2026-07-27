import { Button, Paper, Stack, Typography } from '@mui/material'
import type { Collection } from './types'

export default function CollectionDetail({ collection, onDelete }: { collection?: Collection; onDelete: () => void }) {
  if (!collection) return <Paper sx={{ p: 3 }} variant="outlined"><Typography color="text.secondary">Select a collection to view its details.</Typography></Paper>
  return <Paper sx={{ p: 3 }} variant="outlined"><Stack spacing={2}><Typography component="h2" variant="h4">{collection.name}</Typography><Typography color="text.secondary">Created {new Date(collection.createdAt).toLocaleDateString()}</Typography><Typography color="text.secondary">Bookmarks in this collection will appear here in the next feature.</Typography><Button color="error" onClick={onDelete} sx={{ alignSelf: 'start' }}>Delete collection</Button></Stack></Paper>
}

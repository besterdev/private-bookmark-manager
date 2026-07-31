import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import type { CollectionOption } from './types'

export default function BookmarkDialog({
  open,
  onClose,
  onSubmit,
  collections,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (value: {
    title: string
    url: string
    notes?: string
    collectionId?: string | null
  }) => void
  collections: CollectionOption[]
}) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [collectionId, setCollectionId] = useState('')
  const [error, setError] = useState('')
  const submit = () => {
    const name = title.trim()
    if (!name) {
      setError('Title is required')
      return
    }
    try {
      new URL(url)
    } catch {
      setError('A valid URL is required')
      return
    }
    onSubmit({
      title: name,
      url,
      notes: notes.trim() || undefined,
      collectionId: collectionId || null,
    })
    setError('')
  }
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Create bookmark</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          error={Boolean(error)}
          fullWidth
          helperText={error}
          label="Title"
          margin="dense"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />
        <TextField
          fullWidth
          label="URL"
          margin="dense"
          onChange={(e) => setUrl(e.target.value)}
          value={url}
        />
        <TextField
          fullWidth
          label="Notes"
          margin="dense"
          multiline
          minRows={3}
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
        <TextField
          fullWidth
          label="Collection"
          margin="dense"
          onChange={(e) => setCollectionId(e.target.value)}
          select
          value={collectionId}
        >
          <MenuItem value="">Uncategorized</MenuItem>
          {collections.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={submit} variant="contained">
          Save bookmark
        </Button>
      </DialogActions>
    </Dialog>
  )
}

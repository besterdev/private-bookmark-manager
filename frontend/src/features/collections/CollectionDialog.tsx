import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (name: string) => void
}

export default function CollectionDialog({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return setError('Collection name is required')
    onSubmit(trimmed)
    setName('')
    setError('')
  }
  return (
    <Dialog fullWidth maxWidth="xs" onClose={onClose} open={open}>
      <DialogTitle>Create collection</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          error={Boolean(error)}
          fullWidth
          helperText={error}
          label="Collection name"
          margin="dense"
          onChange={(event) => {
            setName(event.target.value)
            setError('')
          }}
          value={name}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={submit} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}

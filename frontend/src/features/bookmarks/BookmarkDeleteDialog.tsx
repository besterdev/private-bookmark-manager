import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'

import type { Bookmark } from './types'

interface BookmarkDeleteDialogProps {
  bookmark?: Bookmark
  onCancel: () => void
  onConfirm: () => void
}

export default function BookmarkDeleteDialog({
  bookmark,
  onCancel,
  onConfirm,
}: BookmarkDeleteDialogProps) {
  return (
    <Dialog onClose={onCancel} open={Boolean(bookmark)}>
      <DialogTitle>Delete bookmark?</DialogTitle>
      <DialogContent>This cannot be undone.</DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button color="error" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

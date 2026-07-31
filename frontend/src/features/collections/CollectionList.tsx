import { List, ListItemButton, ListItemText, Paper, Typography } from '@mui/material'
import type { Collection } from './types'

export default function CollectionList({
  collections,
  selectedId,
  onSelect,
}: {
  collections: Collection[]
  selectedId?: string
  onSelect: (id: string) => void
}) {
  return (
    <Paper variant="outlined">
      <List disablePadding>
        {collections.map((collection) => (
          <ListItemButton
            key={collection.id}
            onClick={() => onSelect(collection.id)}
            selected={collection.id === selectedId}
          >
            <ListItemText
              primary={collection.name}
              secondary={new Date(collection.createdAt).toLocaleDateString()}
            />
          </ListItemButton>
        ))}
      </List>
      {collections.length === 0 && (
        <Typography color="text.secondary" sx={{ p: 3 }}>
          No collections yet.
        </Typography>
      )}
    </Paper>
  )
}

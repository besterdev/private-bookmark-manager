import { List, ListItemButton, ListItemText, Paper, Typography } from '@mui/material'
import type { Bookmark } from './types'
export default function BookmarkList({
  items,
  selectedId,
  onSelect,
}: {
  items: Bookmark[]
  selectedId?: string
  onSelect: (id: string) => void
}) {
  return (
    <Paper variant="outlined">
      <List disablePadding>
        {items.map((item) => (
          <ListItemButton
            key={item.id}
            onClick={() => onSelect(item.id)}
            selected={item.id === selectedId}
          >
            <ListItemText primary={item.title} secondary={new URL(item.url).hostname} />
          </ListItemButton>
        ))}
      </List>
      {items.length === 0 && (
        <Typography color="text.secondary" sx={{ p: 3 }}>
          No bookmarks found.
        </Typography>
      )}
    </Paper>
  )
}

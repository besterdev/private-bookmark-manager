import { Box, Typography } from '@mui/material'
import BookmarkCard from './BookmarkCard'
import type { Bookmark } from './types'

interface BookmarkCardGridProps {
  collectionNameById: Record<string, string>
  items: Bookmark[]
  onDelete: (bookmark: Bookmark) => void
}

export default function BookmarkCardGrid({
  collectionNameById,
  items,
  onDelete,
}: BookmarkCardGridProps) {
  if (items.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
        No bookmarks found.
      </Typography>
    )
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          lg: 'repeat(3, minmax(0, 1fr))',
          sm: 'repeat(2, minmax(0, 1fr))',
          xs: '1fr',
        },
      }}
    >
      {items.map((bookmark) => (
        <BookmarkCard
          bookmark={bookmark}
          collectionName={
            bookmark.collectionId
              ? (collectionNameById[bookmark.collectionId] ?? 'Unsorted')
              : 'Unsorted'
          }
          key={bookmark.id}
          onDelete={onDelete}
        />
      ))}
    </Box>
  )
}

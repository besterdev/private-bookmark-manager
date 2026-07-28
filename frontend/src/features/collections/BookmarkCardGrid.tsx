import { Box, Typography } from '@mui/material'

import type { Bookmark } from '../bookmarks/types'
import BookmarkCard from './BookmarkCard'

export default function BookmarkCardGrid({ bookmarks }: { bookmarks: Bookmark[] }) {
  if (bookmarks.length === 0) return <Typography color="text.secondary">No bookmarks in this collection yet.</Typography>

  return <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' } }}>
    {bookmarks.map((bookmark) => <BookmarkCard bookmark={bookmark} key={bookmark.id} />)}
  </Box>
}

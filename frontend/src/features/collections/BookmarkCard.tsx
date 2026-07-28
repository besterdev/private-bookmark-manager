import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import { Box, Card, CardContent, Typography } from '@mui/material'

import type { Bookmark } from '../bookmarks/types'

export default function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const host = new URL(bookmark.url).hostname

  return <Card component="a" href={bookmark.url} rel="noreferrer" sx={{ display: 'block', overflow: 'hidden', textDecoration: 'none', transition: 'transform 160ms ease, box-shadow 160ms ease', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' } }} target="_blank" variant="outlined">
    <Box sx={{ alignItems: 'center', aspectRatio: '16 / 9', bgcolor: 'primary.dark', color: 'common.white', display: 'flex', justifyContent: 'center' }}><BookmarkBorderIcon fontSize="large" /></Box>
    <CardContent><Typography color="text.primary" noWrap sx={{ fontWeight: 700 }}>{bookmark.title}</Typography><Typography color="text.secondary" noWrap variant="body2">{host}</Typography></CardContent>
  </Card>
}

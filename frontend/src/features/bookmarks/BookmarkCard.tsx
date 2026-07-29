import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import { Box, Card, CardActionArea, CardActions, CardContent, Chip, IconButton, Typography } from '@mui/material'

import type { Bookmark } from './types'

export default function BookmarkCard({ bookmark, collectionName, onDelete }: { bookmark: Bookmark; collectionName: string; onDelete: (bookmark: Bookmark) => void }) {
  return <Card variant="outlined">
    <CardActionArea component="a" href={bookmark.url} rel="noreferrer" sx={{ '&.Mui-focusVisible': { outline: '3px solid #FF6E00', outlineOffset: -3 } }} target="_blank">
      <Box aria-label={`Bookmark preview for ${bookmark.title}`} role="img" sx={{ alignItems: 'center', aspectRatio: '16 / 9', background: 'linear-gradient(135deg, #003399, #FF6E00)', color: 'common.white', display: 'flex', justifyContent: 'center' }}><BookmarkBorderIcon fontSize="large" /></Box>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}><Typography noWrap sx={{ fontWeight: 700 }}>{bookmark.title}</Typography><Typography color="text.secondary" noWrap variant="body2">{new URL(bookmark.url).hostname}</Typography>{bookmark.notes && <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">{bookmark.notes}</Typography>}</CardContent>
    </CardActionArea>
    <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}><Chip label={collectionName} size="small" /><IconButton aria-label="Delete bookmark" color="error" onClick={() => onDelete(bookmark)}><DeleteOutlinedIcon /></IconButton></CardActions>
  </Card>
}

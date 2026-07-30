import { Button, Paper, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import ErrorState from '../../components/states/ErrorState'
import LoadingState from '../../components/states/LoadingState'
import type { Bookmark } from '../bookmarks/types'
import BookmarkCardGrid from './BookmarkCardGrid'
import type { Collection } from './types'

export default function CollectionDetail({
  collection,
  getBookmarks,
  onDelete,
}: {
  collection?: Collection
  getBookmarks: (collectionId: string) => Promise<Bookmark[]>
  onDelete: () => void
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [retry, setRetry] = useState(0)
  const collectionId = collection?.id

  useEffect(() => {
    if (!collectionId) return

    let active = true
    setLoading(true)
    setError(undefined)
    void getBookmarks(collectionId)
      .then((data) => {
        if (active) setBookmarks(data)
      })
      .catch(() => {
        if (active) setError('Unable to load collection bookmarks')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [collectionId, getBookmarks, retry])

  if (!collection)
    return (
      <Paper sx={{ p: 3 }} variant="outlined">
        <Typography color="text.secondary">Select a collection to view its details.</Typography>
      </Paper>
    )
  return (
    <Paper sx={{ p: 3 }} variant="outlined">
      <Stack spacing={2}>
        <Typography component="h2" variant="h4">
          {collection.name}
        </Typography>
        <Typography color="text.secondary">
          Created {new Date(collection.createdAt).toLocaleDateString()}
        </Typography>
        {loading ? (
          <LoadingState label="Loading collection bookmarks" minHeight={80} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setRetry((value) => value + 1)} />
        ) : (
          <BookmarkCardGrid bookmarks={bookmarks} />
        )}
        <Button color="error" onClick={onDelete} sx={{ alignSelf: 'start' }}>
          Delete collection
        </Button>
      </Stack>
    </Paper>
  )
}

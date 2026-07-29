import { Search } from '@mui/icons-material'
import { Box, Button, Stack, TextField } from '@mui/material'
import type { ReactNode } from 'react'

interface BookmarkSearchToolbarProps {
  children?: ReactNode
  onChange: (value: string) => void
  onSubmit: () => void
  value: string
}

export default function BookmarkSearchToolbar({ children, onChange, onSubmit, value }: BookmarkSearchToolbarProps) {
  return (
    <Box
      aria-label="Bookmark search"
      component="form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      role="search"
    >
      <Stack spacing={1.5}>
        <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.5}>
          <TextField
            fullWidth
            label="Search bookmarks"
            onChange={(event) => onChange(event.target.value)}
            value={value}
          />
          <Button startIcon={<Search />} type="submit" variant="contained">Search</Button>
        </Stack>
        {children}
      </Stack>
    </Box>
  )
}

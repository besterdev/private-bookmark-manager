import { Box, CircularProgress, Stack, Typography } from '@mui/material'

interface LoadingStateProps {
  label: string
  minHeight?: number | string
}

export default function LoadingState({ label, minHeight = 240 }: LoadingStateProps) {
  return (
    <Box aria-label={label} role="status" sx={{ display: 'grid', minHeight, placeItems: 'center' }}>
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <CircularProgress />
        <Typography>{label}</Typography>
      </Stack>
    </Box>
  )
}

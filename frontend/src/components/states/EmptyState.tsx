import { Box, Button, Typography } from '@mui/material'

interface EmptyStateProps {
  actionLabel?: string
  description: string
  onAction?: () => void
  title: string
}

export default function EmptyState({ actionLabel, description, onAction, title }: EmptyStateProps) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 5, textAlign: 'center' }}>
      <Typography component="h2" variant="h6">
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: onAction ? 2 : 0 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="contained">
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}

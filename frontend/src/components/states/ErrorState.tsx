import { Alert, Button } from '@mui/material'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Alert
      action={
        onRetry ? (
          <Button color="inherit" onClick={onRetry} size="small">
            Retry
          </Button>
        ) : undefined
      }
      severity="error"
    >
      {message}
    </Alert>
  )
}

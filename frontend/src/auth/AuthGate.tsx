import { useAuth0 } from '@auth0/auth0-react'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { type ReactNode } from 'react'

interface AuthGateProps {
  children: ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const { isLoading, error, isAuthenticated, loginWithRedirect } = useAuth0()

  if (isLoading) {
    return <Box sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}><Stack spacing={2} sx={{ alignItems: 'center' }}><CircularProgress /><Typography>Signing you in…</Typography></Stack></Box>
  }

  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error.message}</Alert></Box>

  if (!isAuthenticated) {
    return <Box sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center', p: 3 }}><Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 360, textAlign: 'center' }}><Typography component="h1" variant="h4">Private Bookmark Manager</Typography><Typography color="text.secondary">Save and organize links that only you can access.</Typography><Button variant="contained" onClick={() => loginWithRedirect({ appState: { returnTo: window.location.pathname } })}>Sign in</Button></Stack></Box>
  }

  return <>{children}</>
}

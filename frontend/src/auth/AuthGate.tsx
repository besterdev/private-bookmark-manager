import { useAuth0 } from '@auth0/auth0-react'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { type ReactNode, useEffect, useState } from 'react'

import { createApiClient } from '../lib/api-client'

interface AuthGateProps {
  children: ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const { isLoading, error, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiReady, setApiReady] = useState(false)
  const [apiError, setApiError] = useState<string>()

  useEffect(() => {
    if (!isAuthenticated) {
      setApiReady(false)
      setApiError(undefined)
      return
    }

    let active = true
    const api = createApiClient(() => getAccessTokenSilently())

    void api.get('/me')
      .then(() => { if (active) setApiReady(true) })
      .catch((cause: unknown) => { if (active) setApiError(cause instanceof Error ? cause.message : 'Unable to verify API access') })

    return () => { active = false }
  }, [getAccessTokenSilently, isAuthenticated])

  if (isLoading) {
    return <Box sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}><Stack spacing={2} sx={{ alignItems: 'center' }}><CircularProgress /><Typography>Signing you in…</Typography></Stack></Box>
  }

  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error.message}</Alert></Box>

  if (!isAuthenticated) {
    return <Box sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center', p: 3 }}><Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 360, textAlign: 'center' }}><Typography component="h1" variant="h4">Private Bookmark Manager</Typography><Typography color="text.secondary">Save and organize links that only you can access.</Typography><Button variant="contained" onClick={() => loginWithRedirect({ appState: { returnTo: window.location.pathname } })}>Sign in</Button></Stack></Box>
  }

  if (apiError) return <Box sx={{ p: 3 }}><Alert severity="error">API access verification failed: {apiError}</Alert></Box>

  if (!apiReady) {
    return <Box sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}><Stack spacing={2} sx={{ alignItems: 'center' }}><CircularProgress /><Typography>Verifying API access…</Typography></Stack></Box>
  }

  return <>{children}</>
}

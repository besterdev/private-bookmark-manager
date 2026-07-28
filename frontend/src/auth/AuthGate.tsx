import { useAuth0 } from '@auth0/auth0-react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { type ReactNode, useEffect, useState } from 'react'

import ErrorState from '../components/states/ErrorState'
import LoadingState from '../components/states/LoadingState'
import { createApiClient } from '../lib/api-client'

interface AuthGateProps {
  children: ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const { isLoading, error, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiReady, setApiReady] = useState(false)
  const [apiError, setApiError] = useState<string>()
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      setApiReady(false)
      setApiError(undefined)
      return
    }

    let active = true
    const api = createApiClient(() => getAccessTokenSilently())

    void api.get('/me')
      .then(() => { if (active) { setApiError(undefined); setApiReady(true) } })
      .catch((cause: unknown) => { if (active) setApiError(cause instanceof Error ? cause.message : 'Unable to verify API access') })

    return () => { active = false }
  }, [getAccessTokenSilently, isAuthenticated, retry])

  if (isLoading) {
    return <LoadingState label="Signing you in…" minHeight="100vh" />
  }

  if (error) return <Box sx={{ p: 3 }}><ErrorState message={error.message} /></Box>

  if (!isAuthenticated) {
    return <Box sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center', p: 3 }}><Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 360, textAlign: 'center' }}><Typography component="h1" variant="h4">Private Bookmark Manager</Typography><Typography color="text.secondary">Save and organize links that only you can access.</Typography><Button variant="contained" onClick={() => loginWithRedirect({ appState: { returnTo: window.location.pathname } })}>Sign in</Button></Stack></Box>
  }

  if (apiError) return <Box sx={{ p: 3 }}><ErrorState message={`API access verification failed: ${apiError}`} onRetry={() => setRetry((value) => value + 1)} /></Box>

  if (!apiReady) {
    return <LoadingState label="Verifying API access…" minHeight="100vh" />
  }

  return <>{children}</>
}

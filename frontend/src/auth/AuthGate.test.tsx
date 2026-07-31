import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import AuthGate from './AuthGate'

const loginWithRedirect = vi.fn()
const useAuth0 = vi.fn()
const apiGet = vi.hoisted(() => vi.fn())
const sensitive = 'Internal SQL error: ownerId=auth0|victim password=super-secret'

vi.mock('@auth0/auth0-react', () => ({ useAuth0: () => useAuth0() }))
vi.mock('../lib/api-client', () => ({ createApiClient: () => ({ get: apiGet }) }))

afterEach(cleanup)

beforeEach(() => {
  loginWithRedirect.mockReset()
  apiGet.mockReset()
  useAuth0.mockReturnValue({
    isLoading: false,
    error: undefined,
    isAuthenticated: false,
    loginWithRedirect,
  })
})

it('shows a sign-in action while unauthenticated', () => {
  render(
    <AuthGate>
      <div>Private content</div>
    </AuthGate>,
  )

  expect(screen.getByRole('button', { name: 'Sign in' })).toBeVisible()
  expect(screen.queryByText('Private content')).not.toBeInTheDocument()
})

it('shows a loading state while Auth0 initializes', () => {
  useAuth0.mockReturnValue({ isLoading: true })

  render(
    <AuthGate>
      <div>Private content</div>
    </AuthGate>,
  )

  expect(screen.getByText('Signing you in…')).toBeVisible()
})

it('retries API access verification after a failure', async () => {
  apiGet.mockRejectedValueOnce(new Error(sensitive)).mockResolvedValueOnce({})
  useAuth0.mockReturnValue({
    isLoading: false,
    error: undefined,
    isAuthenticated: true,
    getAccessTokenSilently: vi.fn().mockResolvedValue('access-token'),
  })

  render(
    <AuthGate>
      <div>Private content</div>
    </AuthGate>,
  )

  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to verify API access')
  expect(screen.queryByText(sensitive)).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(await screen.findByText('Private content')).toBeVisible()
  expect(apiGet).toHaveBeenCalledTimes(2)
})

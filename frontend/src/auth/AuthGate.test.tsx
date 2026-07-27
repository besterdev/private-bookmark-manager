import { render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'

import AuthGate from './AuthGate'

const loginWithRedirect = vi.fn()
const useAuth0 = vi.fn()

vi.mock('@auth0/auth0-react', () => ({ useAuth0: () => useAuth0() }))

beforeEach(() => {
  loginWithRedirect.mockReset()
  useAuth0.mockReturnValue({
    isLoading: false,
    error: undefined,
    isAuthenticated: false,
    loginWithRedirect,
  })
})

it('shows a sign-in action while unauthenticated', () => {
  render(<AuthGate><div>Private content</div></AuthGate>)

  expect(screen.getByRole('button', { name: 'Sign in' })).toBeVisible()
  expect(screen.queryByText('Private content')).not.toBeInTheDocument()
})

it('shows a loading state while Auth0 initializes', () => {
  useAuth0.mockReturnValue({ isLoading: true })

  render(<AuthGate><div>Private content</div></AuthGate>)

  expect(screen.getByText('Signing you in…')).toBeVisible()
})

import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import App from './App'

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isLoading: false,
    isAuthenticated: true,
    getAccessTokenSilently: vi.fn().mockResolvedValue('access-token'),
    user: { name: 'Candidate' },
    logout: vi.fn(),
  }),
}))

vi.mock('./lib/api-client', () => ({
  createApiClient: () => ({ get: vi.fn().mockResolvedValue([]) }),
}))

it('renders the shell heading and primary navigation after API access is verified', async () => {
  render(<App />)

  expect(await screen.findByRole('heading', { name: 'Private Bookmark Manager' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Collections' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Bookmarks' })).toBeVisible()
})

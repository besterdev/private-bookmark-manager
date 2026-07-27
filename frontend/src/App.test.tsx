import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import App from './App'

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isLoading: false,
    isAuthenticated: true,
    user: { name: 'Candidate' },
    logout: vi.fn(),
  }),
}))

it('renders the shell heading and primary navigation', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: 'Private Bookmark Manager' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Collections' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Bookmarks' })).toBeVisible()
})

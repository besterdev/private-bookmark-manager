import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
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

afterEach(cleanup)

it('renders the shell heading and primary navigation after API access is verified', async () => {
  render(<App />)

  expect(await screen.findByRole('heading', { name: 'Private Bookmark Manager' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Collections' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Bookmarks' })).toBeVisible()
})

it('opens mobile navigation with all application routes and closes it with the close button', async () => {
  render(<App />)
  await screen.findByRole('heading', { name: 'Private Bookmark Manager' })

  fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))

  const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile navigation' })
  expect(within(mobileNavigation).getByRole('link', { name: 'All bookmarks' })).toBeVisible()
  expect(within(mobileNavigation).getByRole('link', { name: 'Collections' })).toBeVisible()
  expect(within(mobileNavigation).getByRole('link', { name: 'Bookmarks' })).toBeVisible()

  fireEvent.click(screen.getByRole('button', { name: 'Close navigation' }))

  await waitFor(() => expect(screen.queryByRole('button', { name: 'Close navigation' })).not.toBeInTheDocument())
})

it('closes mobile navigation after choosing All bookmarks', async () => {
  render(<App />)
  await screen.findByRole('heading', { name: 'Private Bookmark Manager' })

  fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
  fireEvent.click(screen.getAllByRole('link', { name: 'All bookmarks' }).at(-1)!)

  await waitFor(() => expect(screen.queryByRole('button', { name: 'Close navigation' })).not.toBeInTheDocument())
})

it('styles both mobile navigation controls in MUI keyboard-focus state', async () => {
  render(<App />)
  await screen.findByRole('heading', { name: 'Private Bookmark Manager' })

  const openNavigation = screen.getByRole('button', { name: 'Open navigation' })
  openNavigation.classList.add('Mui-focusVisible')

  expect(openNavigation).toHaveStyle({ outline: '3px solid #FF6E00', outlineOffset: '2px' })

  fireEvent.click(openNavigation)
  const closeNavigation = screen.getByRole('button', { name: 'Close navigation' })
  closeNavigation.classList.add('Mui-focusVisible')

  expect(closeNavigation).toHaveStyle({ outline: '3px solid #FF6E00', outlineOffset: '2px' })
})

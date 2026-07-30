import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from './App'

const auth0 = vi.hoisted(() => ({
  getAccessTokenSilently: vi.fn().mockResolvedValue('access-token'),
  logout: vi.fn(),
}))

const collectionRoute = vi.hoisted(() => {
  let resolve: () => void = () => undefined
  let promise = Promise.resolve()

  return {
    isLoading: false,
    startLoading() {
      this.isLoading = true
      promise = new Promise<void>((resolvePromise) => {
        resolve = resolvePromise
      })
    },
    finishLoading() {
      this.isLoading = false
      resolve()
    },
    get promise() {
      return promise
    },
  }
})

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isLoading: false,
    isAuthenticated: true,
    getAccessTokenSilently: auth0.getAccessTokenSilently,
    user: { name: 'Candidate' },
    logout: auth0.logout,
  }),
}))

vi.mock('./routes/CollectionsPage', () => ({
  default: () => {
    if (collectionRoute.isLoading) throw collectionRoute.promise
    return null
  },
}))

vi.mock('./routes/AllBookmarksPage', () => ({ default: () => null }))
vi.mock('./routes/BookmarksPage', () => ({ default: () => null }))
vi.mock('./routes/CallbackPage', () => ({ default: () => null }))

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

it('shows a full-page loading status while an authenticated route module loads', async () => {
  collectionRoute.startLoading()
  render(<App />)

  expect(await screen.findByRole('status', { name: 'Loading page…' })).toBeVisible()
  collectionRoute.finishLoading()
  await waitFor(() =>
    expect(screen.queryByRole('status', { name: 'Loading page…' })).not.toBeInTheDocument(),
  )
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

  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'Close navigation' })).not.toBeInTheDocument(),
  )
})

it('closes mobile navigation after choosing All bookmarks', async () => {
  render(<App />)
  await screen.findByRole('heading', { name: 'Private Bookmark Manager' })

  fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
  fireEvent.click(screen.getAllByRole('link', { name: 'All bookmarks' }).at(-1)!)

  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'Close navigation' })).not.toBeInTheDocument(),
  )
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

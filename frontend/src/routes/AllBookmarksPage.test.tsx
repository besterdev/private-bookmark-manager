import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import AllBookmarksPage from './AllBookmarksPage'

const api = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ getAccessTokenSilently: vi.fn().mockResolvedValue('access-token') }),
}))

vi.mock('../lib/api-client', () => ({ createApiClient: () => api }))

afterEach(() => {
  cleanup()
  api.get.mockReset()
})

it('groups bookmarks by collection and renders uncategorised bookmarks', async () => {
  api.get
    .mockResolvedValueOnce([
      { id: 'collection-1', name: 'Design' },
      { id: 'collection-2', name: 'Engineering' },
    ])
    .mockResolvedValueOnce([
      bookmark({ id: 'bookmark-1', collectionId: 'collection-1', title: 'MUI' }),
      bookmark({ id: 'bookmark-2', collectionId: null, title: 'React' }),
    ])

  render(<AllBookmarksPage />)

  expect(await screen.findByRole('heading', { name: 'Design' })).toBeVisible()
  expect(screen.queryByRole('heading', { name: 'Engineering' })).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Uncategorised' })).toBeVisible()
  expect(screen.getByRole('link', { name: /MUI/i })).toHaveAttribute('href', 'https://example.com')
  expect(screen.getByRole('link', { name: /React/i })).toHaveAttribute('href', 'https://example.com')
})

it('searches all bookmarks with the submitted term', async () => {
  api.get.mockResolvedValue([])
  render(<AllBookmarksPage />)

  await screen.findByRole('heading', { name: 'All bookmarks' })
  fireEvent.change(screen.getByLabelText('Search bookmarks'), { target: { value: ' react ' } })
  fireEvent.submit(screen.getByRole('search'))

  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/bookmarks?q=react'))
})

it('shows a search-aware empty state when no bookmarks match', async () => {
  api.get.mockResolvedValue([])
  render(<AllBookmarksPage />)

  await screen.findByRole('heading', { name: 'All bookmarks' })
  fireEvent.change(screen.getByLabelText('Search bookmarks'), { target: { value: 'missing' } })
  fireEvent.submit(screen.getByRole('search'))

  expect(await screen.findByText('No bookmarks match your search.')).toBeVisible()
})

function bookmark(overrides: Partial<{ id: string; collectionId: string | null; title: string }> = {}) {
  return {
    id: 'bookmark-default',
    title: 'Bookmark',
    url: 'https://example.com',
    notes: null,
    collectionId: null,
    createdAt: '2026-07-29T00:00:00.000Z',
    updatedAt: '2026-07-29T00:00:00.000Z',
    ...overrides,
  }
}

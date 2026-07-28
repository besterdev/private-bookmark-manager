import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import BookmarksPage from './BookmarksPage'

const api = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ getAccessTokenSilently: vi.fn().mockResolvedValue('access-token') }),
}))

vi.mock('../lib/api-client', () => ({
  createApiClient: () => api,
}))

afterEach(() => {
  cleanup()
  api.delete.mockReset()
  api.get.mockReset()
  api.post.mockReset()
})

it('renders bookmarks as cards and opens their delete confirmation', async () => {
  api.get
    .mockResolvedValueOnce([
      {
        id: 'bookmark-1',
        title: 'MUI',
        url: 'https://mui.com',
        notes: null,
        collectionId: 'collection-1',
        createdAt: '2026-07-28T00:00:00.000Z',
        updatedAt: '2026-07-28T00:00:00.000Z',
      },
    ])
    .mockResolvedValueOnce([{ id: 'collection-1', name: 'Design' }])

  render(<BookmarksPage />)

  expect(await screen.findByRole('link', { name: /mui/i })).toHaveAttribute('href', 'https://mui.com')
  fireEvent.click(screen.getByRole('button', { name: 'Delete bookmark' }))

  expect(screen.getByRole('heading', { name: 'Delete bookmark?' })).toBeVisible()
})

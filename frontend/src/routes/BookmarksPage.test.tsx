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

it('retries a failed bookmark request', async () => {
  api.get
    .mockRejectedValueOnce(new Error('Network unavailable'))
    .mockResolvedValue([])

  render(<BookmarksPage />)

  expect(await screen.findByRole('alert')).toHaveTextContent('Network unavailable')
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(await screen.findByText('No bookmarks found.')).toBeVisible()
  expect(api.get).toHaveBeenCalledTimes(4)
})

it('keeps creation open and reports a failed bookmark create', async () => {
  api.get.mockResolvedValue([])
  api.post.mockRejectedValueOnce(new Error('Unable to save bookmark'))
  render(<BookmarksPage />)

  fireEvent.click(await screen.findByRole('button', { name: 'Create bookmark' }))
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'MUI' } })
  fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'https://mui.com' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save bookmark' }))

  expect(await screen.findByText('Unable to save bookmark')).toBeVisible()
  expect(screen.getByRole('dialog', { name: 'Create bookmark' })).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
})

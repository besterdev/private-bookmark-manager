import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import AllBookmarksPage from './AllBookmarksPage'

const api = vi.hoisted(() => ({ delete: vi.fn(), get: vi.fn() }))
const getAccessTokenSilently = vi.hoisted(() => vi.fn().mockResolvedValue('access-token'))

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ getAccessTokenSilently }),
}))

vi.mock('../lib/api-client', () => ({ createApiClient: () => api }))

afterEach(() => {
  cleanup()
  api.delete.mockReset()
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
  expect(screen.getByRole('link', { name: /React/i })).toHaveAttribute(
    'href',
    'https://example.com',
  )
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

it('shows a safe message when loading bookmarks fails', async () => {
  api.get.mockRejectedValue(new Error('Database connection failed: password=super-secret'))

  render(<AllBookmarksPage />)

  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load bookmarks')
  expect(
    screen.queryByText('Database connection failed: password=super-secret'),
  ).not.toBeInTheDocument()
})

it('deletes a bookmark after confirmation and removes its card', async () => {
  api.get
    .mockResolvedValueOnce([{ id: 'collection-1', name: 'Design' }])
    .mockResolvedValueOnce([
      bookmark({ id: 'bookmark-1', collectionId: 'collection-1', title: 'MUI' }),
    ])
  api.delete.mockResolvedValueOnce(undefined)

  render(<AllBookmarksPage />)

  fireEvent.click(await screen.findByRole('button', { name: 'Delete bookmark' }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

  await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/bookmarks/bookmark-1'))
  expect(screen.queryByRole('link', { name: /MUI/i })).not.toBeInTheDocument()
})

it('keeps the bookmark when deletion fails and shows a safe non-retryable error', async () => {
  api.get
    .mockResolvedValueOnce([{ id: 'collection-1', name: 'Design' }])
    .mockResolvedValueOnce([
      bookmark({ id: 'bookmark-1', collectionId: 'collection-1', title: 'MUI' }),
    ])
  api.delete.mockRejectedValueOnce(new Error('Internal SQL error: ownerId=auth0|victim'))

  render(<AllBookmarksPage />)

  fireEvent.click(await screen.findByRole('button', { name: 'Delete bookmark' }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to delete bookmark')
  expect(screen.queryByText('Internal SQL error: ownerId=auth0|victim')).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: /MUI/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
})

it('clears a previous delete error after a successful retry', async () => {
  let resolveRetry!: () => void
  const retry = new Promise<void>((resolve) => {
    resolveRetry = resolve
  })
  api.get
    .mockResolvedValueOnce([{ id: 'collection-1', name: 'Design' }])
    .mockResolvedValueOnce([
      bookmark({ id: 'bookmark-1', collectionId: 'collection-1', title: 'MUI' }),
    ])
  api.delete.mockRejectedValueOnce(new Error('first attempt failed')).mockReturnValueOnce(retry)

  render(<AllBookmarksPage />)

  fireEvent.click(await screen.findByRole('button', { name: 'Delete bookmark' }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to delete bookmark')

  fireEvent.click(screen.getByRole('button', { name: 'Delete bookmark' }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

  await waitFor(() => expect(api.delete).toHaveBeenCalledTimes(2))
  expect(screen.queryByText('Unable to delete bookmark')).not.toBeInTheDocument()

  resolveRetry()
  await waitFor(() => expect(screen.queryByRole('link', { name: /MUI/i })).not.toBeInTheDocument())
})

function bookmark(
  overrides: Partial<{ id: string; collectionId: string | null; title: string }> = {},
) {
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

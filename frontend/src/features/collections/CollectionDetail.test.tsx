import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import CollectionDetail from './CollectionDetail'

const collection = { id: 'c1', name: 'Work', createdAt: '2026-07-28T00:00:00.000Z', updatedAt: '2026-07-28T00:00:00.000Z' }
const sensitive = 'Internal SQL error: ownerId=auth0|victim password=super-secret'

afterEach(cleanup)

it('shows a loading indicator while selected collection bookmarks are requested', () => {
  render(<CollectionDetail collection={collection} getBookmarks={() => new Promise(() => {})} onDelete={vi.fn()} />)

  expect(screen.getByRole('progressbar')).toBeVisible()
})

it('offers Retry after bookmark loading fails', async () => {
  const getBookmarks = vi.fn().mockRejectedValue(new Error(sensitive))
  render(<CollectionDetail collection={collection} getBookmarks={getBookmarks} onDelete={vi.fn()} />)

  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load collection bookmarks')
  expect(screen.queryByText(sensitive)).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(getBookmarks).toHaveBeenCalledTimes(2)
})

it('requests bookmarks for the newly selected collection', async () => {
  const api = { get: vi.fn().mockResolvedValue([]) }
  const getBookmarks = (collectionId: string) => api.get(`/collections/${collectionId}/bookmarks`)
  const { rerender } = render(<CollectionDetail collection={collection} getBookmarks={getBookmarks} onDelete={vi.fn()} />)

  expect(await screen.findByRole('heading', { name: 'Work' })).toBeVisible()
  expect(api.get).toHaveBeenCalledWith('/collections/c1/bookmarks')

  rerender(
    <CollectionDetail
      collection={{ ...collection, id: 'collection-2', name: 'Personal' }}
      getBookmarks={getBookmarks}
      onDelete={vi.fn()}
    />,
  )

  expect(await screen.findByText('Personal')).toBeVisible()
  expect(api.get).toHaveBeenCalledWith('/collections/collection-2/bookmarks')
})

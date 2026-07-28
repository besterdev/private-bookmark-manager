import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import CollectionDetail from './CollectionDetail'

const collection = { id: 'c1', name: 'Work', createdAt: '2026-07-28T00:00:00.000Z', updatedAt: '2026-07-28T00:00:00.000Z' }

it('shows a loading indicator while selected collection bookmarks are requested', () => {
  render(<CollectionDetail collection={collection} getBookmarks={() => new Promise(() => {})} onDelete={vi.fn()} />)

  expect(screen.getByRole('progressbar')).toBeVisible()
})

it('offers Retry after bookmark loading fails', async () => {
  const getBookmarks = vi.fn().mockRejectedValue(new Error('Network unavailable'))
  render(<CollectionDetail collection={collection} getBookmarks={getBookmarks} onDelete={vi.fn()} />)

  expect(await screen.findByText(/network unavailable/i)).toBeVisible()
  expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
})

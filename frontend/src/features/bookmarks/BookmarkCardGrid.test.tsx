import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import BookmarkCardGrid from './BookmarkCardGrid'

const bookmark = {
  id: 'bookmark-1',
  title: 'MUI',
  url: 'https://mui.com',
  notes: null,
  collectionId: 'collection-1',
  createdAt: '2026-07-28T00:00:00.000Z',
  updatedAt: '2026-07-28T00:00:00.000Z',
}

afterEach(cleanup)

it('shows an empty state when there are no bookmarks', () => {
  render(<BookmarkCardGrid collectionNameById={{}} items={[]} onDelete={vi.fn()} />)

  expect(screen.getByText('No bookmarks found.')).toBeVisible()
})

it('renders a card for each bookmark', () => {
  render(
    <BookmarkCardGrid
      collectionNameById={{ 'collection-1': 'Design' }}
      items={[bookmark]}
      onDelete={vi.fn()}
    />,
  )

  expect(screen.getByRole('link', { name: /mui/i })).toHaveAttribute('href', 'https://mui.com')
  expect(screen.getByText('Design')).toBeVisible()
})

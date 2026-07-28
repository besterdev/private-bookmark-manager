import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import BookmarkCardGrid from './BookmarkCardGrid'

const bookmark = (id: string, title: string) => ({ id, title, url: `https://${title.toLowerCase()}.example.com`, notes: null, collectionId: 'c1', createdAt: '2026-07-28T00:00:00.000Z', updatedAt: '2026-07-28T00:00:00.000Z' })

it('shows an empty-state message when the collection has no bookmarks', () => {
  render(<BookmarkCardGrid bookmarks={[]} />)

  expect(screen.getByText('No bookmarks in this collection yet.')).toBeVisible()
})

it('renders every bookmark as a card', () => {
  render(<BookmarkCardGrid bookmarks={[bookmark('b1', 'MUI'), bookmark('b2', 'React')]} />)

  expect(screen.getByRole('link', { name: /mui/i })).toBeVisible()
  expect(screen.getByRole('link', { name: /react/i })).toBeVisible()
})

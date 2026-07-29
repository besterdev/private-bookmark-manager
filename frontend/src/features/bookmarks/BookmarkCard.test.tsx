import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import BookmarkCard from './BookmarkCard'

const bookmark = { id: 'b1', title: 'MUI', url: 'https://mui.com', notes: 'Material UI components', collectionId: 'c1', createdAt: '2026-07-28T00:00:00.000Z', updatedAt: '2026-07-28T00:00:00.000Z' }

afterEach(cleanup)

it('opens the bookmark from its card action area in a new tab safely', () => {
  render(<BookmarkCard bookmark={bookmark} collectionName="Design" onDelete={vi.fn()} />)

  const link = screen.getByRole('link', { name: /mui/i })
  expect(link).toHaveAttribute('href', 'https://mui.com')
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noreferrer')
})

it('labels its branded fallback visual without taking keyboard focus from the external link', () => {
  render(<BookmarkCard bookmark={bookmark} collectionName="Design" onDelete={vi.fn()} />)

  expect(screen.getByRole('img', { name: 'Bookmark preview for MUI' })).toBeVisible()

  const link = screen.getByRole('link', { name: /mui/i })
  link.focus()
  expect(link).toHaveFocus()
})

it('passes its bookmark to the delete action', () => {
  const onDelete = vi.fn()
  render(<BookmarkCard bookmark={bookmark} collectionName="Design" onDelete={onDelete} />)

  fireEvent.click(screen.getByRole('button', { name: 'Delete bookmark' }))
  expect(onDelete).toHaveBeenCalledWith(bookmark)
})

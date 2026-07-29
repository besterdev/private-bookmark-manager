import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import BookmarkDeleteDialog from './BookmarkDeleteDialog'

const bookmark = {
  id: 'bookmark-1',
  title: 'MUI',
  url: 'https://mui.com',
  notes: null,
  collectionId: null,
  createdAt: '2026-07-29T00:00:00.000Z',
  updatedAt: '2026-07-29T00:00:00.000Z',
}

it('calls the confirmation callback only after Delete is selected', () => {
  const onConfirm = vi.fn()

  render(<BookmarkDeleteDialog bookmark={bookmark} onCancel={vi.fn()} onConfirm={onConfirm} />)

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

  expect(onConfirm).toHaveBeenCalledOnce()
})

it('calls the cancellation callback when Cancel is selected', () => {
  const onCancel = vi.fn()

  render(<BookmarkDeleteDialog bookmark={bookmark} onCancel={onCancel} onConfirm={vi.fn()} />)

  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

  expect(onCancel).toHaveBeenCalledOnce()
})

import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import EmptyState from './EmptyState'

it('shows its optional primary action', () => {
  const onAction = vi.fn()
  render(
    <EmptyState
      actionLabel="Create collection"
      description="Create a collection to organize your bookmarks."
      onAction={onAction}
      title="No collections yet"
    />,
  )

  expect(screen.getByRole('heading', { name: 'No collections yet' })).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Create collection' }))
  expect(onAction).toHaveBeenCalledOnce()
})

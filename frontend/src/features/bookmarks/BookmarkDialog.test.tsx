import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import BookmarkDialog from './BookmarkDialog'

it('validates title and URL before submitting a trimmed bookmark', () => {
  const onSubmit = vi.fn()
  render(<BookmarkDialog collections={[]} onClose={vi.fn()} onSubmit={onSubmit} open />)
  fireEvent.click(screen.getByRole('button', { name: 'Save bookmark' }))
  expect(screen.getByText('Title is required')).toBeVisible()
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: '  Docs  ' } })
  fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'https://example.com' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save bookmark' }))
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'Docs', url: 'https://example.com' }))
})

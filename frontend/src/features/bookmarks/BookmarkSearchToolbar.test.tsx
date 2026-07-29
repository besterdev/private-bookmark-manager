import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import BookmarkSearchToolbar from './BookmarkSearchToolbar'

afterEach(cleanup)

it('passes the entered query and submits the search form', () => {
  const onChange = vi.fn()
  const onSubmit = vi.fn()

  render(<BookmarkSearchToolbar onChange={onChange} onSubmit={onSubmit} value="" />)

  fireEvent.change(screen.getByLabelText('Search bookmarks'), { target: { value: 'react' } })
  fireEvent.submit(screen.getByRole('search'))

  expect(onChange).toHaveBeenCalledWith('react')
  expect(onSubmit).toHaveBeenCalledOnce()
})

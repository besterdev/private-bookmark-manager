import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import CollectionDialog from './CollectionDialog'

it('validates a blank name and submits a trimmed name', () => {
  const onSubmit = vi.fn()
  render(<CollectionDialog onClose={vi.fn()} onSubmit={onSubmit} open />)

  fireEvent.click(screen.getByRole('button', { name: 'Create' }))
  expect(screen.getByText('Collection name is required')).toBeVisible()

  fireEvent.change(screen.getByLabelText('Collection name'), { target: { value: '  Work  ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Create' }))
  expect(onSubmit).toHaveBeenCalledWith('Work')
})

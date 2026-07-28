import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import ErrorState from './ErrorState'

afterEach(cleanup)

it('shows an error message and retries when requested', () => {
  const onRetry = vi.fn()
  render(<ErrorState message="Unable to load collections" onRetry={onRetry} />)

  expect(screen.getByRole('alert')).toHaveTextContent('Unable to load collections')
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(onRetry).toHaveBeenCalledOnce()
})

it('does not show Retry without a callback', () => {
  render(<ErrorState message="Unable to load collections" />)

  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
})

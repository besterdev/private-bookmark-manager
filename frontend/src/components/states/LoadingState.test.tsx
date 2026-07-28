import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import LoadingState from './LoadingState'

it('announces its loading label', () => {
  render(<LoadingState label="Loading collections" />)

  expect(screen.getByRole('status', { name: 'Loading collections' })).toBeVisible()
})

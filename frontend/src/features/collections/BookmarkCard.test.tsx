import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import BookmarkCard from './BookmarkCard'

it('opens its bookmark URL in a new tab safely', () => {
  render(
    <BookmarkCard
      bookmark={{
        id: 'b1',
        title: 'MUI',
        url: 'https://mui.com',
        notes: null,
        collectionId: 'c1',
        createdAt: '2026-07-28T00:00:00.000Z',
        updatedAt: '2026-07-28T00:00:00.000Z',
      }}
    />,
  )

  const link = screen.getByRole('link', { name: /mui/i })
  expect(link).toHaveAttribute('href', 'https://mui.com')
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noreferrer')
})

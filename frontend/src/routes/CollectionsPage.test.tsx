import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import CollectionsPage from './CollectionsPage'

const api = vi.hoisted(() => ({ delete: vi.fn(), get: vi.fn(), post: vi.fn() }))

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ getAccessTokenSilently: vi.fn().mockResolvedValue('access-token') }),
}))

vi.mock('../lib/api-client', () => ({ createApiClient: () => api }))

afterEach(() => {
  cleanup()
  api.delete.mockReset()
  api.get.mockReset()
  api.post.mockReset()
})

it('opens collection creation from the shared empty state', async () => {
  api.get.mockResolvedValueOnce([])
  render(<CollectionsPage />)

  fireEvent.click((await screen.findAllByRole('button', { name: 'Create collection' }))[1])
  expect(screen.getByRole('dialog', { name: 'Create collection' })).toBeVisible()
})

it('retries a failed collection request', async () => {
  api.get.mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce([])
  render(<CollectionsPage />)

  expect(await screen.findByRole('alert')).toHaveTextContent('Network unavailable')
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(await screen.findByText('No collections yet')).toBeVisible()
  expect(api.get).toHaveBeenCalledTimes(2)
})

it('keeps creation open and reports a failed collection create', async () => {
  api.get.mockResolvedValueOnce([])
  api.post.mockRejectedValueOnce(new Error('Unable to save collection'))
  render(<CollectionsPage />)

  fireEvent.click((await screen.findAllByRole('button', { name: 'Create collection' }))[1])
  fireEvent.change(screen.getByLabelText('Collection name'), { target: { value: 'Work' } })
  fireEvent.click(screen.getByRole('button', { name: 'Create' }))

  expect(await screen.findByText('Unable to save collection')).toBeVisible()
  expect(screen.getByRole('dialog', { name: 'Create collection' })).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
})

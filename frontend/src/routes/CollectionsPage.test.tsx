import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import CollectionsPage from './CollectionsPage'

const mocks = vi.hoisted(() => {
  const initialToken = vi.fn().mockResolvedValue('access-token')
  const rerenderToken = vi.fn().mockResolvedValue('updated-access-token')

  return {
    api: { delete: vi.fn(), get: vi.fn(), post: vi.fn() },
    createApiClient: vi.fn(),
    initialToken,
    rerenderApi: { delete: vi.fn(), get: vi.fn(), post: vi.fn() },
    rerenderToken,
    currentToken: initialToken,
  }
})
const api = mocks.api
const sensitive = 'Internal SQL error: ownerId=auth0|victim password=super-secret'

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({ getAccessTokenSilently: mocks.currentToken }),
}))

vi.mock('../lib/api-client', () => ({
  createApiClient: mocks.createApiClient,
}))

beforeEach(() => {
  mocks.createApiClient.mockReset()
  mocks.createApiClient.mockReturnValue(mocks.api)
})

afterEach(() => {
  cleanup()
  api.delete.mockReset()
  api.get.mockReset()
  api.post.mockReset()
  mocks.rerenderApi.delete.mockReset()
  mocks.rerenderApi.get.mockReset()
  mocks.rerenderApi.post.mockReset()
  mocks.currentToken = mocks.initialToken
})

it('opens collection creation from the shared empty state', async () => {
  api.get.mockResolvedValueOnce([])
  render(<CollectionsPage />)

  fireEvent.click((await screen.findAllByRole('button', { name: 'Create collection' }))[1])
  expect(screen.getByRole('dialog', { name: 'Create collection' })).toBeVisible()
})

it('retries a failed collection request', async () => {
  api.get.mockRejectedValueOnce(new Error(sensitive)).mockResolvedValueOnce([])
  render(<CollectionsPage />)

  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load collections')
  expect(screen.queryByText(sensitive)).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(await screen.findByText('No collections yet')).toBeVisible()
  expect(api.get).toHaveBeenCalledTimes(2)
  expect(api.get).toHaveBeenLastCalledWith('/collections')
})

it('keeps creation open and reports a failed collection create', async () => {
  api.get.mockResolvedValueOnce([])
  api.post.mockRejectedValueOnce(new Error(sensitive))
  render(<CollectionsPage />)

  fireEvent.click((await screen.findAllByRole('button', { name: 'Create collection' }))[1])
  fireEvent.change(screen.getByLabelText('Collection name'), { target: { value: 'Work' } })
  fireEvent.click(screen.getByRole('button', { name: 'Create' }))

  expect(await screen.findByText('Unable to create collection')).toBeVisible()
  expect(screen.queryByText(sensitive)).not.toBeInTheDocument()
  expect(screen.getByRole('dialog', { name: 'Create collection' })).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
})

it('reloads collections through the latest API client after rerender', async () => {
  api.get.mockResolvedValue([])
  mocks.rerenderApi.get.mockResolvedValue([])
  mocks.createApiClient.mockReturnValueOnce(api).mockReturnValueOnce(mocks.rerenderApi)
  const { rerender } = render(<CollectionsPage />)

  await screen.findByText('No collections yet')
  mocks.currentToken = mocks.rerenderToken
  rerender(<CollectionsPage />)

  await waitFor(() => expect(mocks.rerenderApi.get).toHaveBeenCalledWith('/collections'))
})

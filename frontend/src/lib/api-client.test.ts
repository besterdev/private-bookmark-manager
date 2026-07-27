import { afterEach, expect, it, vi } from 'vitest'

import { ApiError, createApiClient } from './api-client'

afterEach(() => vi.unstubAllGlobals())

it('sends Auth0 access tokens to the configured API', async () => {
  const getAccessTokenSilently = vi.fn().mockResolvedValue('access-token')
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'auth0|user-a' }), { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)

  const client = createApiClient(getAccessTokenSilently, 'http://localhost:3001')

  await expect(client.get<{ id: string }>('/me')).resolves.toEqual({ id: 'auth0|user-a' })
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/me', expect.objectContaining({ headers: { Authorization: 'Bearer access-token' } }))
})

it('throws ApiError when the API responds with an error', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })))

  await expect(createApiClient(vi.fn().mockResolvedValue('access-token'), 'http://localhost:3001').get('/me')).rejects.toBeInstanceOf(ApiError)
})

it('posts JSON and handles a no-content delete response', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'collection-1', name: 'Work' }), { status: 201 }))
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', fetchMock)
  const client = createApiClient(vi.fn().mockResolvedValue('access-token'), 'http://localhost:3001')

  await expect(client.post<{ id: string }>('/collections', { name: 'Work' })).resolves.toEqual({ id: 'collection-1', name: 'Work' })
  await expect(client.delete('/collections/collection-1')).resolves.toBeUndefined()
  expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:3001/collections', expect.objectContaining({ method: 'POST', headers: { Authorization: 'Bearer access-token', 'Content-Type': 'application/json' } }))
})

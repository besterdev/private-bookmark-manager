import axios, { AxiosHeaders } from 'axios'
import { afterEach, expect, it, vi } from 'vitest'

const axiosState = vi.hoisted(() => ({
  requestInterceptor: undefined as
    | ((config: { headers: AxiosHeaders }) => Promise<{ headers: AxiosHeaders }>)
    | undefined,
  responseRejection: undefined as
    | ((cause: unknown) => Promise<never>)
    | undefined,
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  create: vi.fn(),
}))

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  axiosState.create.mockReturnValue({
    get: axiosState.get,
    post: axiosState.post,
    delete: axiosState.delete,
    interceptors: {
      request: {
        use: vi.fn((fulfilled) => {
          axiosState.requestInterceptor = fulfilled
        }),
      },
      response: {
        use: vi.fn((_fulfilled, rejected) => {
          axiosState.responseRejection = rejected
        }),
      },
    },
  })

  return {
    ...actual,
    default: {
      ...actual.default,
      create: axiosState.create,
    },
  }
})

import { createApiClient } from './api-client'

function applyRequestInterceptor(config: { headers: AxiosHeaders }) {
  if (!axiosState.requestInterceptor) throw new Error('Request interceptor was not installed')
  return axiosState.requestInterceptor(config)
}

function applyResponseRejection(cause: unknown) {
  if (!axiosState.responseRejection) throw new Error('Response interceptor was not installed')
  return axiosState.responseRejection(cause)
}

afterEach(() => {
  vi.clearAllMocks()
  axiosState.requestInterceptor = undefined
  axiosState.responseRejection = undefined
})

it('creates an Axios instance for the configured API and attaches the Auth0 access token', async () => {
  const getAccessTokenSilently = vi.fn().mockResolvedValue('access-token')
  const client = createApiClient(getAccessTokenSilently, 'http://localhost:3001')
  axiosState.get.mockResolvedValue({ data: { id: 'auth0|user-a' } })

  await client.get<{ id: string }>('/me')

  expect(axios.create).toHaveBeenCalledWith({
    allowAbsoluteUrls: false,
    baseURL: 'http://localhost:3001',
  })
  const config = await applyRequestInterceptor({ headers: new AxiosHeaders() })
  expect(config.headers.get('Authorization')).toBe('Bearer access-token')
})

it('returns typed response data for GET and POST and resolves DELETE with no content', async () => {
  const client = createApiClient(vi.fn().mockResolvedValue('access-token'), 'http://localhost:3001')
  axiosState.get.mockResolvedValue({ data: { id: 'auth0|user-a' } })
  axiosState.post.mockResolvedValue({ data: { id: 'collection-1', name: 'Work' } })
  axiosState.delete.mockResolvedValue({})

  await expect(client.get('/me')).resolves.toEqual({ id: 'auth0|user-a' })
  await expect(client.post('/collections', { name: 'Work' }))
    .resolves.toEqual({ id: 'collection-1', name: 'Work' })
  await expect(client.delete('/collections/collection-1')).resolves.toBeUndefined()

  expect(axiosState.get).toHaveBeenCalledWith('/me')
  expect(axiosState.post).toHaveBeenCalledWith('/collections', { name: 'Work' })
  expect(axiosState.delete).toHaveBeenCalledWith('/collections/collection-1')
})

it('normalizes Axios HTTP and network failures as ApiError', async () => {
  createApiClient(vi.fn().mockResolvedValue('access-token'), 'http://localhost:3001')

  await expect(applyResponseRejection({
    isAxiosError: true,
    response: { status: 401, data: { message: 'Unauthorized' } },
  })).rejects.toMatchObject({ name: 'ApiError', status: 401 })

  await expect(applyResponseRejection({
    isAxiosError: true,
    response: { status: 400, data: { message: ['Title is required'] } },
  })).rejects.toMatchObject({
    name: 'ApiError',
    status: 400,
    message: 'Request failed (400)',
  })

  await expect(applyResponseRejection({
    isAxiosError: true,
    message: 'Network Error',
  })).rejects.toMatchObject({
    name: 'ApiError',
    status: 0,
    message: 'Network request failed',
  })
})

import axios, { AxiosError } from 'axios'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type GetAccessToken = () => Promise<string>

export function createApiClient(
  getAccessTokenSilently: GetAccessToken,
  baseUrl = import.meta.env.VITE_API_BASE_URL,
) {
  const http = axios.create({ allowAbsoluteUrls: false, baseURL: baseUrl })

  http.interceptors.request.use(async (config) => {
    if (typeof baseUrl !== 'string' || baseUrl.trim() === '') {
      throw new Error('API base URL is not configured')
    }

    const token = await getAccessTokenSilently()
    config.headers.set('Authorization', `Bearer ${token}`)
    return config
  })

  http.interceptors.response.use(
    (response) => response,
    (cause: unknown) => {
      if (!axios.isAxiosError(cause)) return Promise.reject(cause)

      const error = cause as AxiosError<{ message?: unknown }>
      const status = error.response?.status ?? 0
      const message = typeof error.response?.data?.message === 'string'
        ? error.response.data.message
        : status === 0
          ? 'Network request failed'
          : `Request failed (${status})`

      return Promise.reject(new ApiError(status, message))
    },
  )

  return {
    get: async <T>(path: string): Promise<T> => (await http.get<T>(path)).data,
    post: async <T>(path: string, body: unknown): Promise<T> =>
      (await http.post<T>(path, body)).data,
    delete: async (path: string): Promise<void> => {
      await http.delete(path)
    },
  }
}

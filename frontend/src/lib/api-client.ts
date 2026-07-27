export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type GetAccessToken = () => Promise<string>

export function createApiClient(getAccessTokenSilently: GetAccessToken, baseUrl = import.meta.env.VITE_API_BASE_URL) {
  return {
    async get<T>(path: string): Promise<T> {
      const token = await getAccessTokenSilently()
      const response = await fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { message?: string }
        throw new ApiError(response.status, body.message ?? `Request failed (${response.status})`)
      }
      return response.json() as Promise<T>
    },
  }
}

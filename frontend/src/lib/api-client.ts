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
  async function request<T>(path: string, init: RequestInit = {}): Promise<T | undefined> {
    const token = await getAccessTokenSilently()
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers } })
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { message?: string }
      throw new ApiError(response.status, body.message ?? `Request failed (${response.status})`)
    }
    if (response.status === 204) return undefined
    return response.json() as Promise<T>
  }

  return {
    async get<T>(path: string): Promise<T> {
      return request<T>(path) as Promise<T>
    },
    async post<T>(path: string, body: unknown): Promise<T> { return request<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) as Promise<T> },
    async delete(path: string): Promise<void> { await request(path, { method: 'DELETE' }) },
  }
}

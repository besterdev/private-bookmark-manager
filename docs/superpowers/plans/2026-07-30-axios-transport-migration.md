# Axios Transport Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the frontend API client's internal `fetch` transport with Axios without changing the interface used by routes or `AuthGate`.

**Architecture:** `createApiClient` creates a private `AxiosInstance`, attaches the current Auth0 access token through a request interceptor, normalizes Axios failures through a response interceptor, and continues returning unwrapped typed data from `get` and `post`. Consumer components remain transport-agnostic and require no Axios-specific changes.

**Tech Stack:** React 19, TypeScript 6, Axios, Auth0 React SDK, Vitest, Bun

## Global Constraints

- Use Bun for dependencies and commit `bun.lock`.
- Use Node.js `>=22.12.0 <23` for verification.
- Preserve `createApiClient(getAccessTokenSilently, baseUrl?)` and its `get`, `post`, and `delete` methods.
- Never log or expose access tokens, request headers, Axios configuration, or backend implementation details.
- Do not add token retry, refresh, cancellation, generated clients, or direct Axios usage in route components.
- Keep all existing backend endpoints and response contracts unchanged.

---

### Task 1: Replace the API client transport with Axios

**Files:**
- Modify: `frontend/package.json`
- Modify: `bun.lock`
- Modify: `frontend/src/lib/api-client.test.ts`
- Modify: `frontend/src/lib/api-client.ts`

**Interfaces:**
- Consumes: `getAccessTokenSilently: () => Promise<string>` and optional `baseUrl: string`.
- Produces: `createApiClient(getAccessTokenSilently, baseUrl?)` returning `get<T>(path): Promise<T>`, `post<T>(path, body): Promise<T>`, and `delete(path): Promise<void>`.
- Preserves: `ApiError` with `readonly status: number`.

- [ ] **Step 1: Add Axios using Bun**

Run:

```bash
bun --cwd frontend add axios
```

Expected: `axios` appears under frontend dependencies and `bun.lock` is updated without another package-manager lockfile.

- [ ] **Step 2: Rewrite the API-client tests first**

Replace fetch stubs in `frontend/src/lib/api-client.test.ts` with an Axios module mock that captures the configured `baseURL`, request interceptor, response rejection interceptor, and instance method calls.

Define the test seam explicitly:

```ts
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

function applyRequestInterceptor(config: { headers: AxiosHeaders }) {
  if (!axiosState.requestInterceptor) throw new Error('Request interceptor was not installed')
  return axiosState.requestInterceptor(config)
}

function applyResponseRejection(cause: unknown) {
  if (!axiosState.responseRejection) throw new Error('Response interceptor was not installed')
  return axiosState.responseRejection(cause)
}
```

The tests must prove these behaviors before production code changes:

```ts
it('creates an Axios instance for the configured API and attaches the Auth0 access token', async () => {
  const client = createApiClient(getAccessTokenSilently, 'http://localhost:3001')
  await client.get<{ id: string }>('/me')

  expect(axios.create).toHaveBeenCalledWith({ baseURL: 'http://localhost:3001' })
  const config = await applyRequestInterceptor({ headers: new AxiosHeaders() })
  expect(config.headers.get('Authorization')).toBe('Bearer access-token')
})

it('returns typed response data for GET and POST and resolves DELETE with no content', async () => {
  const client = createApiClient(getAccessTokenSilently, 'http://localhost:3001')

  await expect(client.get('/me')).resolves.toEqual({ id: 'auth0|user-a' })
  await expect(client.post('/collections', { name: 'Work' }))
    .resolves.toEqual({ id: 'collection-1', name: 'Work' })
  await expect(client.delete('/collections/collection-1')).resolves.toBeUndefined()
})

it('normalizes Axios HTTP and network failures as ApiError', async () => {
  await expect(applyResponseRejection({
    isAxiosError: true,
    response: { status: 401, data: { message: 'Unauthorized' } },
  })).rejects.toMatchObject({ name: 'ApiError', status: 401 })

  await expect(applyResponseRejection({
    isAxiosError: true,
    message: 'Network Error',
  })).rejects.toMatchObject({
    name: 'ApiError',
    status: 0,
    message: 'Network request failed',
  })
})
```

Use a string-only response-message guard so NestJS validation arrays or arbitrary response bodies fall back to `Request failed (<status>)`.

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/lib/api-client.test.ts
```

Expected: FAIL because the current implementation calls `fetch`, never creates an Axios instance, and does not install interceptors.

- [ ] **Step 4: Implement the minimal Axios transport**

Update `frontend/src/lib/api-client.ts` to:

```ts
import axios, { AxiosError } from 'axios'

const http = axios.create({ baseURL })

http.interceptors.request.use(async (config) => {
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
```

Return transport-agnostic methods that unwrap only `response.data`:

```ts
get: async <T>(path: string): Promise<T> => (await http.get<T>(path)).data,
post: async <T>(path: string, body: unknown): Promise<T> =>
  (await http.post<T>(path, body)).data,
delete: async (path: string): Promise<void> => {
  await http.delete(path)
},
```

Do not set `Content-Type` manually; Axios handles JSON object serialization.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test src/lib/api-client.test.ts
```

Expected: all API-client tests pass.

- [ ] **Step 6: Run the frontend regression suite**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend test
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend lint
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend typecheck
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun --cwd frontend build
```

Expected: tests, lint, typecheck, and build pass. Existing documented hook or bundle-size warnings may remain but no new warning is acceptable.

- [ ] **Step 7: Commit the migration**

```bash
git add frontend/package.json bun.lock frontend/src/lib/api-client.ts frontend/src/lib/api-client.test.ts
git commit -m "♻️ refactor: migrate API transport to Axios"
```

### Task 2: Senior engineering review and final verification

**Files:**
- Review: `frontend/src/lib/api-client.ts`
- Review: `frontend/src/lib/api-client.test.ts`
- Review: `frontend/package.json`
- Review: `bun.lock`

**Interfaces:**
- Consumes: the Task 1 commit and the approved design at `docs/superpowers/specs/2026-07-30-axios-frontend-client-design.md`.
- Produces: a prioritized review report and, only when necessary, focused fixes with regression tests.

- [ ] **Step 1: Review the implementation against project standards**

Inspect the Task 1 diff for:

- one Axios instance and one interceptor pair per `createApiClient` call;
- access token acquisition on every request rather than at client creation;
- no token, headers, or Axios configuration in logs or rendered errors;
- correct `AxiosError` narrowing without `any`;
- string-only NestJS message extraction;
- safe fallback for network and malformed error responses;
- no Axios imports or `.data` handling in route components;
- no retry, refresh, global singleton, or speculative abstraction;
- tests that prove observable behavior rather than only mock invocation counts.

- [ ] **Step 2: Fix only actionable findings**

For each correctness, security, or maintainability finding:

1. Add or adjust a test that fails for the finding.
2. Run the focused test and verify RED.
3. Apply the smallest production fix.
4. Run the focused test and verify GREEN.
5. Commit with an appropriate Gitmoji subject.

If there are no actionable findings, do not create a review-only commit.

- [ ] **Step 3: Run final project checks**

Run:

```bash
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run lint
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run typecheck
AUTH0_ISSUER_URL=https://example.auth0.com/ AUTH0_AUDIENCE=https://api.example.test PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run test
PATH=/Users/thawatchai/.nvm/versions/node/v22.19.0/bin:$PATH bun run build
git diff --check HEAD~1..HEAD
```

Expected: all applicable checks pass on Node.js 22.19.0. Report warnings separately and never describe an unrun check as passing.

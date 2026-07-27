# Project Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize a Bun-managed monorepo with a Vite React frontend and NestJS backend.

**Architecture:** The root workspace coordinates two independently deployable applications. `frontend/` owns React, React Router, and MUI; `backend/` owns NestJS and later API, OIDC, and Prisma work.

**Tech Stack:** Bun 1.3.14, Node.js 22.3.0, TypeScript, React, Vite, MUI, NestJS, Jest, Playwright.

## Global Constraints

- Use Bun workspaces and commit `bun.lock`.
- Use Node.js 22 for NestJS, Jest, and Playwright execution.
- Keep secrets out of committed files; commit only `.env.example` placeholders.
- TypeScript strict mode is required; frontend must not access the database or Prisma.

---

### Task 1: Establish the Bun workspace

**Files:**
- Create: `.gitignore`, `.env.example`, `package.json`, `bunfig.toml`
- Modify: `AGENTS.md`, `TASKS.md`

**Produces:** Root commands named `dev`, `lint`, `typecheck`, `test`, `test:e2e`, and `build`; Bun workspaces `frontend` and `backend`.

- [ ] **Step 1: Initialize version control and exclusions**

Run:

```bash
git init
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
coverage/
playwright-report/
test-results/
.env
.env.local
*.log
```

- [ ] **Step 2: Create the root workspace manifest**

Create `package.json`:

```json
{
  "name": "private-bookmark-manager",
  "private": true,
  "workspaces": ["frontend", "backend"],
  "scripts": {
    "dev": "bun --filter '*' run dev",
    "lint": "bun --filter '*' run lint",
    "typecheck": "bun --filter '*' run typecheck",
    "test": "bun --filter '*' run test",
    "test:e2e": "bun --filter '*' run test:e2e",
    "build": "bun --filter '*' run build"
  }
}
```

Create `bunfig.toml`:

```toml
[install]
linker = "isolated"
minimumReleaseAge = 259200
minimumReleaseAgeExcludes = ["@types/node", "typescript"]
```

- [ ] **Step 3: Create placeholders and verify Bun installation**

Create `.env.example`:

```dotenv
VITE_API_BASE_URL=http://localhost:3001
```

Run:

```bash
bun install
bun pm ls
```

Expected: `bun.lock` exists and both commands exit with code 0.

- [ ] **Step 4: Commit the workspace foundation**

Run:

```bash
git add AGENTS.md TASKS.md .gitignore .env.example package.json bunfig.toml bun.lock
git commit -m "🎉 chore: initialize bun workspace"
```

### Task 2: Scaffold the React and MUI frontend

**Files:**
- Create: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`
- Create: `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/App.test.tsx`, `frontend/src/test/setup.ts`

**Consumes:** Bun workspace from Task 1.

**Produces:** A Vite app with MUI design tokens and a visible `Private Bookmark Manager` heading.

- [ ] **Step 1: Create the application and install required dependencies**

Run:

```bash
bun create vite frontend --template react-ts
bun --cwd frontend add react-router @mui/material @mui/icons-material @emotion/react @emotion/styled
bun --cwd frontend add -d vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Write the failing frontend smoke test**

Create `frontend/src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

it('renders the application name', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Private Bookmark Manager' })).toBeVisible();
});
```

Run:

```bash
bun --cwd frontend run test
```

Expected: FAIL until the application shell and test configuration are added.

- [ ] **Step 3: Implement the minimal design-system-aware app shell**

Create `frontend/src/App.tsx`:

```tsx
import { CssBaseline, ThemeProvider, Typography, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#003399' },
    secondary: { main: '#FF6E00' },
    text: { primary: '#3F3F3F' },
    background: { default: '#F7F8FC' },
  },
  shape: { borderRadius: 10 },
  spacing: 8,
});

export default function App() {
  return <ThemeProvider theme={theme}><CssBaseline /><Typography component="h1" variant="h4">Private Bookmark Manager</Typography></ThemeProvider>;
}
```

Configure Vitest with `environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`, and import `@testing-library/jest-dom/vitest` from the setup file. Set package scripts to `vite`, `tsc -b && vite build`, `tsc -b --pretty false`, and `vitest run` for development, build, typecheck, and tests.

- [ ] **Step 4: Verify and commit frontend**

Run:

```bash
bun --cwd frontend run test
bun --cwd frontend run typecheck
bun --cwd frontend run build
```

Expected: all commands exit with code 0.

```bash
git add frontend bun.lock
git commit -m "✨ feat: scaffold react frontend"
```

### Task 3: Scaffold the NestJS backend

**Files:**
- Create: `backend/package.json`, `backend/nest-cli.json`, `backend/tsconfig.json`
- Create: `backend/src/main.ts`, `backend/src/app.module.ts`, `backend/src/app.controller.ts`, `backend/src/app.controller.spec.ts`

**Consumes:** Bun workspace from Task 1.

**Produces:** A NestJS API on port `3001` with `GET /healthz` returning `{ status: 'ok' }`.

- [ ] **Step 1: Create the backend and install validation prerequisites**

Run:

```bash
bunx @nestjs/cli new backend --package-manager bun --skip-git
bun --cwd backend add @nestjs/config class-validator class-transformer
```

- [ ] **Step 2: Write the failing health unit test**

Create `backend/src/app.controller.spec.ts`:

```ts
import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppModule } from './app.module';

describe('AppController', () => {
  it('returns an OK health status', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    expect(moduleRef.get(AppController).health()).toEqual({ status: 'ok' });
  });
});
```

Run:

```bash
node ./backend/node_modules/jest/bin/jest.js ./backend/src/app.controller.spec.ts --runInBand
```

Expected: FAIL because `health()` does not exist yet.

- [ ] **Step 3: Implement the health endpoint**

Create `backend/src/app.controller.ts`:

```ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('healthz')
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
```

Set `backend/src/main.ts` to listen on `process.env.PORT ?? 3001`.

- [ ] **Step 4: Verify and commit backend**

Run:

```bash
node ./backend/node_modules/jest/bin/jest.js --runInBand
node ./backend/node_modules/@nestjs/cli/bin/nest.js build
```

Expected: both commands exit with code 0.

```bash
git add backend bun.lock
git commit -m "✨ feat: scaffold nest backend"
```

## Plan self-review

- **Coverage:** Initializes Bun, React/Vite, React Router, MUI, NestJS, Node-runtime test path, and the first verification commands. Auth0, Prisma, CRUD, and browser E2E are intentionally deferred to later feature plans.
- **Type consistency:** The frontend test expects the heading rendered by `App`; the backend test expects the `health()` method used by the HTTP health route.
- **No placeholders:** Every setup command, file, test assertion, and expected verification result is specified.

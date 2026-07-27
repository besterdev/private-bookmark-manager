# Private Bookmark Manager — Make Commands

This project uses Bun. Run all commands from the repository root unless noted otherwise.

## Initial setup

```bash
bun install
cp .env.example .env
```

Fill the placeholder values in `.env` before starting Docker. Do not commit this file.

## Run with Docker

```bash
# Build and start MySQL, backend, and frontend
docker compose up --build -d

# Check running services
docker compose ps

# Follow backend logs
docker compose logs -f backend

# Stop services
docker compose down
```

| Service | Address |
| --- | --- |
| Frontend | http://localhost:3000 |
| Backend health check | http://localhost:3001/healthz |
| MySQL | `localhost:3306` |

## Database

```bash
# Apply committed migrations in the backend container
docker compose exec backend ./node_modules/.bin/prisma migrate deploy

# Create development seed users
docker compose exec backend ./node_modules/.bin/prisma db seed

# Create a new migration locally
cd backend
bunx prisma migrate dev --name <migration_name>
```

For local migration commands, set `DATABASE_URL` to a MySQL connection string in `backend/.env` or your shell environment.

## Local development

```bash
# Start frontend and backend together
bun run dev

# Start one app only
cd backend && bun run start:dev
cd frontend && bun run dev
```

## Quality commands

```bash
bun run lint
bun run typecheck
bun run build
```

Test commands are intentionally deferred for the current project setup phase.

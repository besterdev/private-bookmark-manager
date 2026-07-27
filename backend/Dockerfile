FROM oven/bun:1.3.14 AS build
WORKDIR /app
ENV DATABASE_URL=mysql://app_user:app_password@mysql:3306/bookmark_manager
COPY package.json bun.lock ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN bun install --frozen-lockfile
COPY backend ./backend
WORKDIR /app/backend
RUN bunx prisma generate && bun run build

FROM node:22.19.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
WORKDIR /app/backend
EXPOSE 3001
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/main"]

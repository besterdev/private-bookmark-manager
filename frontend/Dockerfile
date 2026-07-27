FROM oven/bun:1.3.14 AS build
WORKDIR /app
COPY package.json bun.lock ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN bun install --frozen-lockfile
COPY frontend ./frontend
WORKDIR /app/frontend
RUN bun run build

FROM nginx:1.27-alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80

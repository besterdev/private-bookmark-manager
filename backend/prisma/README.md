# Database baseline

## Collection deletion

Deleting a collection preserves its bookmarks and sets their `collectionId` to `NULL`. The API implementation must expose the same behaviour and enforce bookmark ownership before allowing the deletion.

## Seed data

After `docker compose up --build`, run this command from `backend/` with a `DATABASE_URL` that points to the MySQL service to create the two development users:

```bash
bunx prisma db seed
```

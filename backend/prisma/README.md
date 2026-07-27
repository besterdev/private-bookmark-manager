# Database baseline

## Collection deletion

Deleting a collection preserves its bookmarks and sets their `collectionId` to `NULL`. The API implementation must expose the same behaviour and enforce bookmark ownership before allowing the deletion.

## Local verification

After `docker compose up --build`, run these commands from `backend/` with a `DATABASE_URL` that points to the MySQL service:

```bash
bunx prisma db seed
node prisma/verify-collection-deletion.js
```

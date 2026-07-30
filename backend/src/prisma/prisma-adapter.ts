import { PrismaMariaDb } from '@prisma/adapter-mariadb';

export function createPrismaAdapter(databaseUrlValue: string): PrismaMariaDb {
  const databaseUrl = new URL(databaseUrlValue);

  return new PrismaMariaDb({
    host: databaseUrl.hostname,
    port: Number(databaseUrl.port || 3306),
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: databaseUrl.pathname.slice(1),
    connectionLimit: 5,
    allowPublicKeyRetrieval: true,
  });
}

export function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  return databaseUrl;
}

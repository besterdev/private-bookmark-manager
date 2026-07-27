const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { PrismaClient } = require('@prisma/client');

const databaseUrl = new URL(requireDatabaseUrl());
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: databaseUrl.hostname,
    port: Number(databaseUrl.port || 3306),
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: databaseUrl.pathname.slice(1),
    connectionLimit: 5,
  }),
});

async function main() {
  await prisma.user.upsert({
    where: { email: 'owner-a@example.test' },
    update: { name: 'Owner A' },
    create: { id: 'auth0|seed-owner-a', email: 'owner-a@example.test', name: 'Owner A' },
  });
  await prisma.user.upsert({
    where: { email: 'owner-b@example.test' },
    update: { name: 'Owner B' },
    create: { id: 'auth0|seed-owner-b', email: 'owner-b@example.test', name: 'Owner B' },
  });
}

function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  return process.env.DATABASE_URL;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });

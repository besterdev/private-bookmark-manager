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
const suffix = `verification-${Date.now()}`;

async function main() {
  const user = await prisma.user.create({ data: { id: `auth0|${suffix}`, email: `${suffix}@example.test` } });
  try {
    const collection = await prisma.collection.create({ data: { name: 'Temporary collection', ownerId: user.id } });
    const bookmark = await prisma.bookmark.create({
      data: { url: 'https://example.test', title: 'Temporary bookmark', ownerId: user.id, collectionId: collection.id },
    });
    await prisma.collection.delete({ where: { id: collection.id } });
    const savedBookmark = await prisma.bookmark.findUniqueOrThrow({ where: { id: bookmark.id } });
    if (savedBookmark.collectionId !== null) throw new Error('Deleting a collection must unlink its bookmarks');
  } finally {
    await prisma.user.delete({ where: { id: user.id } });
  }
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

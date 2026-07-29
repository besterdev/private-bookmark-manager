import { NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { BookmarksService } from './bookmarks.service';

const ownerId = 'auth0|user-a';
const bookmark = {
  id: 'bookmark-1',
  url: 'https://example.com',
  title: 'Example',
  notes: null,
  collectionId: null,
  createdAt: new Date('2026-07-27T00:00:00.000Z'),
  updatedAt: new Date('2026-07-27T00:00:00.000Z'),
};

describe('BookmarksService', () => {
  const prisma = {
    bookmark: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    collection: { findFirst: jest.fn() },
  };
  let service: BookmarksService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new BookmarksService(prisma as unknown as PrismaService);
  });

  it('creates an uncategorized bookmark for the authenticated owner', async () => {
    prisma.bookmark.create.mockResolvedValue(bookmark);

    await expect(
      service.create(ownerId, { ...bookmark, collectionId: null }),
    ).resolves.toEqual(bookmark);
    const createMock = prisma.bookmark.create as jest.Mock<unknown, [unknown]>;
    const createArguments = createMock.mock.calls[0]?.[0];
    expect(createArguments).toMatchObject({
      data: { ownerId, collectionId: null },
    });
  });

  it('rejects assignment to a collection outside the authenticated owner', async () => {
    prisma.collection.findFirst.mockResolvedValue(null);

    await expect(
      service.create(ownerId, {
        url: bookmark.url,
        title: bookmark.title,
        collectionId: 'foreign-collection',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists bookmarks scoped to the owner and an owned collection filter', async () => {
    prisma.collection.findFirst.mockResolvedValue({ id: 'collection-1' });
    prisma.bookmark.findMany.mockResolvedValue([bookmark]);

    await expect(
      service.findAll(ownerId, { collectionId: 'collection-1' }),
    ).resolves.toEqual([bookmark]);
    expect(prisma.bookmark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId, collectionId: 'collection-1' },
      }),
    );
  });

  it('returns not found for another user bookmark', async () => {
    prisma.bookmark.findFirst.mockResolvedValue(null);

    await expect(service.findOne(bookmark.id, ownerId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates and deletes only an owned bookmark', async () => {
    prisma.bookmark.findFirst.mockResolvedValue(bookmark);
    prisma.bookmark.update.mockResolvedValue({ ...bookmark, title: 'Updated' });
    prisma.bookmark.delete.mockResolvedValue(bookmark);

    await expect(
      service.update(bookmark.id, ownerId, { title: 'Updated' }),
    ).resolves.toMatchObject({
      title: 'Updated',
    });
    await expect(service.remove(bookmark.id, ownerId)).resolves.toBeUndefined();
  });
});

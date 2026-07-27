import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionsService } from './collections.service';

const ownerId = 'auth0|user-a';
const collection = {
  id: 'collection-1',
  name: 'Work',
  createdAt: new Date('2026-07-27T00:00:00.000Z'),
  updatedAt: new Date('2026-07-27T00:00:00.000Z'),
};

describe('CollectionsService', () => {
  const prisma = {
    collection: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  let service: CollectionsService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new CollectionsService(prisma as unknown as PrismaService);
  });

  it('creates a collection for the authenticated owner', async () => {
    prisma.collection.create.mockResolvedValue(collection);

    await expect(service.create(ownerId, { name: 'Work' })).resolves.toEqual(
      collection,
    );
    expect(prisma.collection.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { ownerId, name: 'Work' } }),
    );
  });

  it('lists only the authenticated owner collections', async () => {
    prisma.collection.findMany.mockResolvedValue([collection]);

    await expect(service.findAll(ownerId)).resolves.toEqual([collection]);
    expect(prisma.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { ownerId } }),
    );
  });

  it('throws not found when a collection does not belong to the owner', async () => {
    prisma.collection.findFirst.mockResolvedValue(null);

    await expect(
      service.findOne(collection.id, ownerId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates an owned collection', async () => {
    prisma.collection.findFirst.mockResolvedValue(collection);
    prisma.collection.update.mockResolvedValue({
      ...collection,
      name: 'Personal',
    });

    await expect(
      service.update(collection.id, ownerId, { name: 'Personal' }),
    ).resolves.toMatchObject({
      name: 'Personal',
    });
  });

  it('replaces an owned collection', async () => {
    prisma.collection.findFirst.mockResolvedValue(collection);
    prisma.collection.update.mockResolvedValue({
      ...collection,
      name: 'Reading',
    });

    await expect(
      service.replace(collection.id, ownerId, { name: 'Reading' }),
    ).resolves.toMatchObject({
      name: 'Reading',
    });
  });

  it('deletes an owned collection', async () => {
    prisma.collection.findFirst.mockResolvedValue(collection);
    prisma.collection.delete.mockResolvedValue(collection);

    await expect(
      service.remove(collection.id, ownerId),
    ).resolves.toBeUndefined();
    expect(prisma.collection.delete).toHaveBeenCalledWith({
      where: { id: collection.id },
    });
  });
});

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { ListBookmarksQueryDto } from './dto/list-bookmarks-query.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

const bookmarkSelect = {
  id: true,
  url: true,
  title: true,
  notes: true,
  collectionId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BookmarkSelect;

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateBookmarkDto) {
    await this.ensureOwnedCollection(dto.collectionId, ownerId);
    return this.prisma.bookmark.create({
      data: {
        ownerId,
        url: dto.url,
        title: dto.title,
        notes: dto.notes ?? null,
        collectionId: dto.collectionId ?? null,
      },
      select: bookmarkSelect,
    });
  }

  async findAll(ownerId: string, query: ListBookmarksQueryDto) {
    if (query.collectionId)
      await this.findOwnedCollection(query.collectionId, ownerId);
    return this.prisma.bookmark.findMany({
      where: {
        ownerId,
        ...(query.collectionId ? { collectionId: query.collectionId } : {}),
      },
      select: bookmarkSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, ownerId: string) {
    return this.findOwnedBookmark(id, ownerId);
  }

  async replace(id: string, ownerId: string, dto: CreateBookmarkDto) {
    await this.findOwnedBookmark(id, ownerId);
    await this.ensureOwnedCollection(dto.collectionId, ownerId);
    return this.prisma.bookmark.update({
      where: { id },
      data: {
        url: dto.url,
        title: dto.title,
        notes: dto.notes ?? null,
        collectionId: dto.collectionId ?? null,
      },
      select: bookmarkSelect,
    });
  }

  async update(id: string, ownerId: string, dto: UpdateBookmarkDto) {
    if (Object.keys(dto).length === 0)
      throw new BadRequestException('At least one property is required');
    await this.findOwnedBookmark(id, ownerId);
    await this.ensureOwnedCollection(dto.collectionId, ownerId);

    const data: Prisma.BookmarkUncheckedUpdateInput = {};
    if (dto.url !== undefined) data.url = dto.url;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.collectionId !== undefined) data.collectionId = dto.collectionId;

    return this.prisma.bookmark.update({
      where: { id },
      data,
      select: bookmarkSelect,
    });
  }

  async remove(id: string, ownerId: string): Promise<void> {
    await this.findOwnedBookmark(id, ownerId);
    await this.prisma.bookmark.delete({ where: { id } });
  }

  async findByCollection(collectionId: string, ownerId: string) {
    await this.findOwnedCollection(collectionId, ownerId);
    return this.prisma.bookmark.findMany({
      where: { ownerId, collectionId },
      select: bookmarkSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async ensureOwnedCollection(
    collectionId: string | null | undefined,
    ownerId: string,
  ): Promise<void> {
    if (collectionId) await this.findOwnedCollection(collectionId, ownerId);
  }

  private async findOwnedBookmark(id: string, ownerId: string) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { id, ownerId },
      select: bookmarkSelect,
    });
    if (!bookmark) throw new NotFoundException('Bookmark not found');
    return bookmark;
  }

  private async findOwnedCollection(id: string, ownerId: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { id, ownerId },
      select: { id: true },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }
}

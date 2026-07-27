import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

const collectionSelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CollectionSelect;

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(ownerId: string, dto: CreateCollectionDto) {
    return this.prisma.collection.create({
      data: { ownerId, name: dto.name },
      select: collectionSelect,
    });
  }

  findAll(ownerId: string) {
    return this.prisma.collection.findMany({
      where: { ownerId },
      select: collectionSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, ownerId: string) {
    return this.findOwned(id, ownerId);
  }

  async replace(id: string, ownerId: string, dto: CreateCollectionDto) {
    await this.findOwned(id, ownerId);
    return this.prisma.collection.update({
      where: { id },
      data: { name: dto.name },
      select: collectionSelect,
    });
  }

  async update(id: string, ownerId: string, dto: UpdateCollectionDto) {
    if (dto.name === undefined) {
      throw new BadRequestException('At least one property is required');
    }

    await this.findOwned(id, ownerId);
    return this.prisma.collection.update({
      where: { id },
      data: { name: dto.name },
      select: collectionSelect,
    });
  }

  async remove(id: string, ownerId: string): Promise<void> {
    await this.findOwned(id, ownerId);
    await this.prisma.collection.delete({ where: { id } });
  }

  private async findOwned(id: string, ownerId: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { id, ownerId },
      select: collectionSelect,
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }
}

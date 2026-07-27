import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import type { VerifiedAuth0Claims } from '../auth/authenticated-request.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Controller('collections')
@UseGuards(AuthGuard)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  create(
    @CurrentUser() user: VerifiedAuth0Claims,
    @Body() dto: CreateCollectionDto,
  ) {
    return this.collectionsService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: VerifiedAuth0Claims) {
    return this.collectionsService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: VerifiedAuth0Claims, @Param('id') id: string) {
    return this.collectionsService.findOne(id, user.sub);
  }

  @Put(':id')
  replace(
    @CurrentUser() user: VerifiedAuth0Claims,
    @Param('id') id: string,
    @Body() dto: CreateCollectionDto,
  ) {
    return this.collectionsService.replace(id, user.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: VerifiedAuth0Claims,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: VerifiedAuth0Claims,
    @Param('id') id: string,
  ): Promise<void> {
    await this.collectionsService.remove(id, user.sub);
  }
}

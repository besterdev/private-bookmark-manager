import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import type { VerifiedAuth0Claims } from '../auth/authenticated-request.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { ListBookmarksQueryDto } from './dto/list-bookmarks-query.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

@Controller('bookmarks')
@UseGuards(AuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  create(@CurrentUser() user: VerifiedAuth0Claims, @Body() dto: CreateBookmarkDto) {
    return this.bookmarksService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: VerifiedAuth0Claims, @Query() query: ListBookmarksQueryDto) {
    return this.bookmarksService.findAll(user.sub, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: VerifiedAuth0Claims, @Param('id') id: string) {
    return this.bookmarksService.findOne(id, user.sub);
  }

  @Put(':id')
  replace(@CurrentUser() user: VerifiedAuth0Claims, @Param('id') id: string, @Body() dto: CreateBookmarkDto) {
    return this.bookmarksService.replace(id, user.sub, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: VerifiedAuth0Claims, @Param('id') id: string, @Body() dto: UpdateBookmarkDto) {
    return this.bookmarksService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: VerifiedAuth0Claims, @Param('id') id: string): Promise<void> {
    await this.bookmarksService.remove(id, user.sub);
  }
}

import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import type { VerifiedAuth0Claims } from '../auth/authenticated-request.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { BookmarksService } from './bookmarks.service';

@Controller('collections')
@UseGuards(AuthGuard)
export class CollectionBookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get(':id/bookmarks')
  findByCollection(@CurrentUser() user: VerifiedAuth0Claims, @Param('id') id: string) {
    return this.bookmarksService.findByCollection(id, user.sub);
  }
}

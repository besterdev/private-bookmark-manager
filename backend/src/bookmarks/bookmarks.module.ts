import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { CollectionBookmarksController } from './collection-bookmarks.controller';

@Module({
  imports: [AuthModule],
  controllers: [BookmarksController, CollectionBookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}

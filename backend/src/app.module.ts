import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CollectionsModule } from './collections/collections.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, UsersModule, CollectionsModule],
  controllers: [AppController],
})
export class AppModule {}

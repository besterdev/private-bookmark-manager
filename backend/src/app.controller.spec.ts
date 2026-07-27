import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  it('returns an OK health status', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    expect(moduleRef.get(AppController).health()).toEqual({ status: 'ok' });
  });
});

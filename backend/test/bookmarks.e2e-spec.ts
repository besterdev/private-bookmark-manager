import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/auth/auth.guard';
import { Auth0JwtService } from '../src/auth/auth0-jwt.service';
import { PrismaService } from '../src/prisma/prisma.service';

const userA = 'auth0|user-a';
const userB = 'auth0|user-b';

class TestAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { sub: string };
    }>();
    if (request.headers.authorization === 'Bearer test-user-a') {
      request.user = { sub: userA };
      return true;
    }
    if (request.headers.authorization === 'Bearer test-user-b') {
      request.user = { sub: userB };
      return true;
    }
    throw new UnauthorizedException();
  }
}

describe('Bookmarks (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useClass(TestAuthGuard)
      .overrideProvider(Auth0JwtService)
      .useValue({ verifyAccessToken: jest.fn() })
      .compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.bookmark.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany();
    await prisma.user.createMany({ data: [{ id: userA }, { id: userB }] });
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('requires authentication and validates bookmark input', async () => {
    await request(app.getHttpServer()).get('/bookmarks').expect(401);
    await request(app.getHttpServer())
      .post('/bookmarks')
      .set('Authorization', 'Bearer test-user-a')
      .send({ url: 'not-a-url', title: '  ' })
      .expect(400);
  });

  it('creates, lists, reads, replaces, patches, and deletes an owned bookmark', async () => {
    const created = await request(app.getHttpServer())
      .post('/bookmarks')
      .set('Authorization', 'Bearer test-user-a')
      .send({
        url: 'https://example.com',
        title: '  Example  ',
        notes: '  read later  ',
      })
      .expect(201);
    const bookmarkId = responseId(created.body);

    expect(created.body).toMatchObject({
      title: 'Example',
      notes: 'read later',
      collectionId: null,
    });
    expect(created.body).not.toHaveProperty('ownerId');

    await request(app.getHttpServer())
      .get('/bookmarks')
      .set('Authorization', 'Bearer test-user-a')
      .expect(200)
      .expect(({ body }) =>
        expect(body).toEqual([expect.objectContaining({ id: bookmarkId })]),
      );

    await request(app.getHttpServer())
      .get(`/bookmarks/${bookmarkId}`)
      .set('Authorization', 'Bearer test-user-a')
      .expect(200);

    await request(app.getHttpServer())
      .put(`/bookmarks/${bookmarkId}`)
      .set('Authorization', 'Bearer test-user-a')
      .send({ url: 'https://example.org', title: 'Replaced' })
      .expect(200)
      .expect(({ body }) =>
        expect(body).toMatchObject({ title: 'Replaced', notes: null }),
      );

    await request(app.getHttpServer())
      .patch(`/bookmarks/${bookmarkId}`)
      .set('Authorization', 'Bearer test-user-a')
      .send({ title: 'Patched' })
      .expect(200)
      .expect(({ body }) => expect(body).toMatchObject({ title: 'Patched' }));

    await request(app.getHttpServer())
      .delete(`/bookmarks/${bookmarkId}`)
      .set('Authorization', 'Bearer test-user-a')
      .expect(204);
  });

  it('filters bookmarks and reads a collection bookmark list only for its owner', async () => {
    const collection = await prisma.collection.create({
      data: { name: 'Work', ownerId: userA },
    });
    await prisma.bookmark.create({
      data: {
        ownerId: userA,
        collectionId: collection.id,
        url: 'https://example.com',
        title: 'Example',
      },
    });

    await request(app.getHttpServer())
      .get('/bookmarks')
      .query({ collectionId: collection.id })
      .set('Authorization', 'Bearer test-user-a')
      .expect(200)
      .expect(({ body }) => expect(body).toHaveLength(1));

    await request(app.getHttpServer())
      .get(`/collections/${collection.id}/bookmarks`)
      .set('Authorization', 'Bearer test-user-a')
      .expect(200)
      .expect(({ body }) => expect(body).toHaveLength(1));
  });

  it('searches an owner\'s bookmark titles and notes with an optional collection filter', async () => {
    const collection = await prisma.collection.create({
      data: { name: 'Work', ownerId: userA },
    });
    const titleMatch = await prisma.bookmark.create({
      data: {
        ownerId: userA,
        collectionId: collection.id,
        url: 'https://react.dev',
        title: 'React documentation',
      },
    });
    const notesMatch = await prisma.bookmark.create({
      data: {
        ownerId: userA,
        url: 'https://example.com',
        title: 'Reference',
        notes: 'Read the React guide later',
      },
    });
    await prisma.bookmark.create({
      data: {
        ownerId: userB,
        url: 'https://example.org',
        title: 'React private bookmark',
      },
    });

    await request(app.getHttpServer())
      .get('/bookmarks')
      .query({ q: 'react' })
      .set('Authorization', 'Bearer test-user-a')
      .expect(200)
      .expect(({ body }) =>
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: titleMatch.id }),
            expect.objectContaining({ id: notesMatch.id }),
          ]),
        ),
      );

    await request(app.getHttpServer())
      .get('/bookmarks')
      .query({ q: 'react', collectionId: collection.id })
      .set('Authorization', 'Bearer test-user-a')
      .expect(200)
      .expect(({ body }) =>
        expect(body).toEqual([expect.objectContaining({ id: titleMatch.id })]),
      );
  });

  it('validates search terms and keeps foreign collections private when searching', async () => {
    const foreignCollection = await prisma.collection.create({
      data: { name: 'Private', ownerId: userB },
    });

    await request(app.getHttpServer())
      .get('/bookmarks')
      .query({ q: 'a'.repeat(121) })
      .set('Authorization', 'Bearer test-user-a')
      .expect(400);

    await request(app.getHttpServer())
      .get('/bookmarks')
      .query({ q: 'private', collectionId: foreignCollection.id })
      .set('Authorization', 'Bearer test-user-a')
      .expect(404);
  });

  it('hides foreign bookmarks and collections from another user', async () => {
    const foreignCollection = await prisma.collection.create({
      data: { name: 'Private', ownerId: userB },
    });
    const foreignBookmark = await prisma.bookmark.create({
      data: {
        ownerId: userB,
        collectionId: foreignCollection.id,
        url: 'https://example.com',
        title: 'Private',
      },
    });

    await request(app.getHttpServer())
      .get('/bookmarks')
      .set('Authorization', 'Bearer test-user-a')
      .expect(200)
      .expect(({ body }) => expect(body).toEqual([]));

    for (const method of ['get', 'patch', 'delete'] as const) {
      const endpoint = `/bookmarks/${foreignBookmark.id}`;
      const builder = request(app.getHttpServer())
        [method](endpoint)
        .set('Authorization', 'Bearer test-user-a');
      await (
        method === 'patch' ? builder.send({ title: 'Changed' }) : builder
      ).expect(404);
    }

    await request(app.getHttpServer())
      .get('/bookmarks')
      .query({ collectionId: foreignCollection.id })
      .set('Authorization', 'Bearer test-user-a')
      .expect(404);
    await request(app.getHttpServer())
      .get(`/collections/${foreignCollection.id}/bookmarks`)
      .set('Authorization', 'Bearer test-user-a')
      .expect(404);

    await request(app.getHttpServer())
      .post('/bookmarks')
      .set('Authorization', 'Bearer test-user-a')
      .send({
        url: 'https://example.org',
        title: 'Blocked',
        collectionId: foreignCollection.id,
      })
      .expect(404);
  });
});

function responseId(body: unknown): string {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('id' in body) ||
    typeof body.id !== 'string'
  ) {
    throw new Error('Response does not include a string id');
  }
  return body.id;
}

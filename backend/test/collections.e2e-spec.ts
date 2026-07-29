import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
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
    const token = request.headers.authorization;

    if (token === 'Bearer test-user-a') {
      request.user = { sub: userA };
      return true;
    }

    if (token === 'Bearer test-user-b') {
      request.user = { sub: userB };
      return true;
    }

    throw new UnauthorizedException('Unauthorized');
  }
}

describe('Collections (e2e)', () => {
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
    if (app) {
      await app.close();
    }
  });

  it('requires authentication', async () => {
    const response = await request(app.getHttpServer())
      .get('/collections')
      .expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized',
    });
  });

  it('validates and trims a collection name', async () => {
    const invalidResponse = await request(app.getHttpServer())
      .post('/collections')
      .set('Authorization', 'Bearer test-user-a')
      .send({ name: '   ' })
      .expect(400);

    expect(invalidResponse.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
    expect(responseMessages(invalidResponse.body)).toEqual(
      expect.arrayContaining([expect.stringMatching(/should not be empty/)]),
    );

    const response = await request(app.getHttpServer())
      .post('/collections')
      .set('Authorization', 'Bearer test-user-a')
      .send({ name: '  Work  ' })
      .expect(201);

    expect(response.body).toMatchObject({ name: 'Work' });
    expect(response.body).not.toHaveProperty('ownerId');
  });

  it('creates, lists, reads, replaces, and updates an owned collection', async () => {
    const created = await request(app.getHttpServer())
      .post('/collections')
      .set('Authorization', 'Bearer test-user-a')
      .send({ name: 'Work' })
      .expect(201);
    const collectionId = responseId(created.body);

    await request(app.getHttpServer())
      .get('/collections')
      .set('Authorization', 'Bearer test-user-a')
      .expect(200)
      .expect(({ body }) =>
        expect(body).toEqual([
          expect.objectContaining({ id: collectionId, name: 'Work' }),
        ]),
      );

    await request(app.getHttpServer())
      .get(`/collections/${collectionId}`)
      .set('Authorization', 'Bearer test-user-a')
      .expect(200)
      .expect(({ body }) => expect(body).toMatchObject({ name: 'Work' }));

    await request(app.getHttpServer())
      .put(`/collections/${collectionId}`)
      .set('Authorization', 'Bearer test-user-a')
      .send({ name: 'Personal' })
      .expect(200)
      .expect(({ body }) => expect(body).toMatchObject({ name: 'Personal' }));

    await request(app.getHttpServer())
      .patch(`/collections/${collectionId}`)
      .set('Authorization', 'Bearer test-user-a')
      .send({ name: 'Reading' })
      .expect(200)
      .expect(({ body }) => expect(body).toMatchObject({ name: 'Reading' }));
  });

  it('returns not found for collections owned by another user', async () => {
    const foreignCollection = await prisma.collection.create({
      data: { name: 'Private', ownerId: userB },
    });

    await request(app.getHttpServer())
      .get('/collections')
      .set('Authorization', 'Bearer test-user-a')
      .expect(200)
      .expect(({ body }) => expect(body).toEqual([]));

    for (const method of ['get', 'patch', 'delete'] as const) {
      const requestBuilder = request(app.getHttpServer())
        [method](`/collections/${foreignCollection.id}`)
        .set('Authorization', 'Bearer test-user-a');
      const response =
        method === 'patch'
          ? requestBuilder.send({ name: 'Changed' })
          : requestBuilder;
      const errorResponse = await response.expect(404);
      expect(errorResponse.body).toEqual({
        statusCode: 404,
        message: 'Collection not found',
        error: 'Not Found',
      });
    }
  });

  it('deletes the collection and keeps its bookmarks uncategorized', async () => {
    const collection = await prisma.collection.create({
      data: { name: 'Work', ownerId: userA },
    });
    const bookmark = await prisma.bookmark.create({
      data: {
        ownerId: userA,
        collectionId: collection.id,
        title: 'Docs',
        url: 'https://example.com',
      },
    });

    await request(app.getHttpServer())
      .delete(`/collections/${collection.id}`)
      .set('Authorization', 'Bearer test-user-a')
      .expect(204);

    await expect(
      prisma.bookmark.findUnique({ where: { id: bookmark.id } }),
    ).resolves.toMatchObject({
      collectionId: null,
    });
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

function responseMessages(body: unknown): string[] {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('message' in body) ||
    !Array.isArray(body.message)
  ) {
    throw new Error('Response does not include validation messages');
  }
  return body.message.filter(
    (message): message is string => typeof message === 'string',
  );
}

import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { Auth0JwtService } from '../src/auth/auth0-jwt.service';
import { AuthGuard } from '../src/auth/auth.guard';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

describe('Authorization (e2e)', () => {
  let app: INestApplication<App>;
  const jwtService = { verifyAccessToken: jest.fn() };
  const usersService = { findOrCreateCurrentUser: jest.fn() };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [AuthGuard, Auth0JwtService, UsersService],
    })
      .overrideProvider(Auth0JwtService)
      .useValue(jwtService)
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects GET /me when the bearer token is missing', async () => {
    await request(app.getHttpServer()).get('/me').expect(401);
  });

  it('rejects GET /me when JWT validation fails', async () => {
    jwtService.verifyAccessToken.mockRejectedValue(new UnauthorizedException());

    await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('returns the current user when a bearer token is verified', async () => {
    jwtService.verifyAccessToken.mockResolvedValue({
      sub: 'github|123',
      email: 'mac@example.com',
      name: 'Mac',
    });
    usersService.findOrCreateCurrentUser.mockResolvedValue({
      id: 'github|123',
      email: 'mac@example.com',
      name: 'Mac',
    });

    await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect({ id: 'github|123', email: 'mac@example.com', name: 'Mac' });
  });
});

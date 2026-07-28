import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';

import { AuthGuard } from './auth.guard';
import type { VerifiedAuth0Claims } from './authenticated-request.interface';
import { Auth0JwtService } from './auth0-jwt.service';

function contextFor(request: { headers: { authorization?: string }; user?: VerifiedAuth0Claims }) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  const claims: VerifiedAuth0Claims = {
    sub: 'github|123',
    email: 'mac@example.com',
    name: 'Mac',
  };

  it('rejects a protected request without a bearer token', async () => {
    const jwtService = { verifyAccessToken: jest.fn() } as unknown as Auth0JwtService;
    const guard = new AuthGuard(jwtService);
    const request = { headers: {} };

    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(UnauthorizedException);
    expect(request).not.toHaveProperty('user');
  });

  it('rejects a protected request with a non-bearer authorization scheme', async () => {
    const jwtService = { verifyAccessToken: jest.fn() } as unknown as Auth0JwtService;
    const guard = new AuthGuard(jwtService);
    const request = { headers: { authorization: 'Basic ZGVtbzpkZW1v' } };

    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(UnauthorizedException);
    expect(request).not.toHaveProperty('user');
  });

  it('attaches verified access-token claims to the request', async () => {
    const jwtService = {
      verifyAccessToken: jest.fn().mockResolvedValue(claims),
    } as unknown as Auth0JwtService;
    const guard = new AuthGuard(jwtService);
    const request = { headers: { authorization: 'Bearer access-token' } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request).toMatchObject({ user: claims });
  });
});

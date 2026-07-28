import { createServer, type Server } from 'node:http';

import { UnauthorizedException } from '@nestjs/common';
import type { CryptoKey } from 'jose';

import { Auth0JwtService } from './auth0-jwt.service';

describe('Auth0JwtService', () => {
  const previousIssuer = process.env.AUTH0_ISSUER_URL;
  const previousAudience = process.env.AUTH0_AUDIENCE;
  let issuer: string;
  let jose: typeof import('jose');
  let server: Server;
  let privateKey: CryptoKey;

  beforeAll(async () => {
    jose = await import('jose');
    const keyPair = await jose.generateKeyPair('RS256');
    privateKey = keyPair.privateKey;
    const publicJwk = await jose.exportJWK(keyPair.publicKey);
    publicJwk.kid = 'test-key';

    server = createServer((request, response) => {
      if (request.url !== '/.well-known/jwks.json') {
        response.writeHead(404).end();
        return;
      }

      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ keys: [publicJwk] }));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('JWKS server did not start');
    issuer = `http://127.0.0.1:${address.port}/`;
  });

  beforeEach(() => {
    process.env.AUTH0_ISSUER_URL = issuer;
    process.env.AUTH0_AUDIENCE = 'https://bbl-candidate-test-api';
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    process.env.AUTH0_ISSUER_URL = previousIssuer;
    process.env.AUTH0_AUDIENCE = previousAudience;
  });

  it('returns claims from an RS256 token signed by the configured JWKS', async () => {
    const token = await signedToken({
      audience: 'https://bbl-candidate-test-api',
      issuer,
      privateKey,
    });

    await expect(new Auth0JwtService().verifyAccessToken(token)).resolves.toEqual({
      sub: 'github|123',
      email: 'mac@example.com',
      name: 'Mac',
    });
  });

  it('rejects a token issued for a different audience', async () => {
    const token = await signedToken({
      audience: 'https://another-api.example',
      issuer,
      privateKey,
    });

    await expect(new Auth0JwtService().verifyAccessToken(token)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

async function signedToken({ audience, issuer, privateKey }: { audience: string; issuer: string; privateKey: CryptoKey }): Promise<string> {
  const jose = await import('jose');
  return new jose.SignJWT({ email: 'mac@example.com', name: 'Mac' })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
    .setSubject('github|123')
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(privateKey);
}

import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { VerifiedAuth0Claims } from './authenticated-request.interface';

type JoseModule = typeof import('jose');

@Injectable()
export class Auth0JwtService {
  private readonly issuer = requiredEnvironmentValue('AUTH0_ISSUER_URL');
  private readonly audience = requiredEnvironmentValue('AUTH0_AUDIENCE');
  private remoteJwks?: ReturnType<JoseModule['createRemoteJWKSet']>;

  async verifyAccessToken(token: string): Promise<VerifiedAuth0Claims> {
    try {
      const { createRemoteJWKSet, jwtVerify } = await import('jose');
      const verifiedToken = await jwtVerify(
        token,
        this.getRemoteJwks(createRemoteJWKSet),
        {
          issuer: this.issuer,
          audience: this.audience,
          algorithms: ['RS256'],
        },
      );

      if (
        typeof verifiedToken.payload.sub !== 'string' ||
        !verifiedToken.payload.sub
      ) {
        throw new UnauthorizedException('Unauthorized');
      }

      return {
        sub: verifiedToken.payload.sub,
        email: stringClaim(verifiedToken.payload.email),
        name: stringClaim(verifiedToken.payload.name),
      };
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  private getRemoteJwks(createRemoteJWKSet: JoseModule['createRemoteJWKSet']) {
    this.remoteJwks ??= createRemoteJWKSet(
      new URL('.well-known/jwks.json', this.issuer),
    );
    return this.remoteJwks;
  }
}

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function stringClaim(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

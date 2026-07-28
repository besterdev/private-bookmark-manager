import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Auth0JwtService } from './auth0-jwt.service';
import type { AuthenticatedRequest } from './authenticated-request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth0JwtService: Auth0JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = bearerToken(request.headers.authorization);

    request.user = await this.auth0JwtService.verifyAccessToken(token);
    return true;
  }
}

function bearerToken(authorization: string | string[] | undefined): string {
  if (typeof authorization !== 'string') {
    throw new UnauthorizedException('Unauthorized');
  }

  const match = /^Bearer (.+)$/.exec(authorization);
  if (!match) {
    throw new UnauthorizedException('Unauthorized');
  }

  return match[1];
}

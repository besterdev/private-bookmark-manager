import { Module } from '@nestjs/common';

import { Auth0JwtService } from './auth0-jwt.service';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [Auth0JwtService, AuthGuard],
  exports: [Auth0JwtService, AuthGuard],
})
export class AuthModule {}

import { Controller, Get, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import type { VerifiedAuth0Claims } from '../auth/authenticated-request.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';

@Controller()
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(
    @CurrentUser() claims: VerifiedAuth0Claims,
  ): Promise<CurrentUserResponse> {
    const user = await this.usersService.findOrCreateCurrentUser(claims);

    return { id: user.id, email: user.email, name: user.name };
  }
}

interface CurrentUserResponse {
  id: string;
  email: string | null;
  name: string | null;
}

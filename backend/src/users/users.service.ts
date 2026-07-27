import { Injectable } from '@nestjs/common';

import type { VerifiedAuth0Claims } from '../auth/authenticated-request.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateCurrentUser(claims: VerifiedAuth0Claims) {
    return this.prisma.user.upsert({
      where: { id: claims.sub },
      update: { email: claims.email ?? null, name: claims.name ?? null },
      create: { id: claims.sub, email: claims.email ?? null, name: claims.name ?? null },
    });
  }
}

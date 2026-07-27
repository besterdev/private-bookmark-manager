import type { Request } from 'express';

export interface VerifiedAuth0Claims {
  sub: string;
  email?: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user: VerifiedAuth0Claims;
}

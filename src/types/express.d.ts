import type { Request } from 'express';
import type { JwtUserData } from 'src/guards/auth.guard';

declare module 'express' {
  interface AuthenticatedRequest extends Request {
    user?: JwtUserData;
  }
}

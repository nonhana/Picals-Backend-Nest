import type { Request } from 'express';
import type { JwtUserData } from '@/guards/auth.guard';

export type DEVICES_TYPE = 'mobile' | 'desktop';

export interface AuthenticatedRequest extends Request {
	user?: JwtUserData;
}

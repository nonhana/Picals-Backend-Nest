import type { User } from '../entities/user.entity';

export class LoginUserVo {
	userInfo: User;
	accessToken: string;
	refreshToken: string;
}

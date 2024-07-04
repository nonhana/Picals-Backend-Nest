import type { User } from '../entities/user.entity';

export class UserItemVo {
	id: string;
	username: string;
	email: string;
	avatar: string;
	intro: string;
	isFollowing: boolean;
	works?: string[]; // 作品id列表

	constructor(user: User, isFollowing: boolean) {
		this.id = user.id;
		this.username = user.username;
		this.email = user.email;
		this.avatar = user.avatar;
		this.intro = user.signature;
		this.isFollowing = isFollowing;
		if (user.illustrations) this.works = user.illustrations.map((item) => item.id);
	}
}

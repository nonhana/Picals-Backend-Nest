import type { User } from '../entities/user.entity';

export class UserItemVo {
	id: string;
	username: string;
	avatar: string;
	intro: string;
	works: string[]; // 作品id列表
	isFollowing: boolean;

	constructor(user: User, isFollowing: boolean) {
		this.id = user.id;
		this.username = user.username;
		this.avatar = user.avatar;
		this.intro = user.signature;
		this.works = user.illustrations.map((item) => item.id);
		this.isFollowing = isFollowing;
	}
}

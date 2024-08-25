import type { User } from '../entities/user.entity';
import { IllustrationItemVO } from 'src/apps/illustration/vo/illustration-item.vo';

export class UserItemVo {
	id: string;
	username: string;
	email: string;
	avatar: string;
	intro: string;
	isFollowing: boolean;
	works?: IllustrationItemVO[];

	constructor(user: User, isFollowing: boolean, workLikeList: boolean[]) {
		this.id = user.id;
		this.username = user.username;
		this.email = user.email;
		this.avatar = user.littleAvatar;
		this.intro = user.signature;
		this.isFollowing = isFollowing;
		if (user.illustrations && workLikeList.length)
			this.works = user.illustrations.map(
				(work, index) => new IllustrationItemVO(work, workLikeList[index]),
			);
	}
}

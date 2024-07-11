import type { User } from '../entities/user.entity';
import type { LabelItemVO } from 'src/apps/label/vo/label-item.vo';

export class userLoginInfoVo {
	id: string;
	username: string;
	email: string;
	backgroundImg: string;
	avatar: string;
	littleAvatar: string;
	signature: string;
	gender: number;
	fanCount: number;
	followCount: number;
	originCount: number;
	reprintedCount: number;
	likeCount: number;
	collectCount: number;
	favoriteCount: number;
	createdTime: Date;
	updatedTime: Date;
	likedLabels: LabelItemVO[];

	constructor(user: User) {
		this.id = user.id;
		this.username = user.username;
		this.email = user.email;
		this.backgroundImg = user.backgroundImg;
		this.avatar = user.avatar;
		this.littleAvatar = user.littleAvatar;
		this.signature = user.signature;
		this.gender = user.gender;
		this.fanCount = user.fanCount;
		this.followCount = user.followCount;
		this.originCount = user.originCount;
		this.reprintedCount = user.reprintedCount;
		this.likeCount = user.likeCount;
		this.collectCount = user.collectCount;
		this.favoriteCount = user.favoriteCount;
		this.createdTime = user.createdTime;
		this.updatedTime = user.updatedTime;
		this.likedLabels = user.likedLabels.map((label) => ({
			id: label.id,
			name: label.value,
			cover: label.cover,
			color: label.color,
		}));
	}
}

export class LoginUserVo {
	userInfo: userLoginInfoVo;
	accessToken: string;
	refreshToken: string;
}

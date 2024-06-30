import type { Illustration } from 'src/apps/illustration/entities/illustration.entity';
import * as dayjs from 'dayjs';

export class IllustrationItemVO {
	authorAvatar: string;
	authorId: string;
	authorName: string;
	id: string;
	imgList: string[];
	cover: string;
	name: string;
	isLiked: boolean;
	createdAt: string;

	constructor(illustration: Illustration, isLiked: boolean) {
		this.authorAvatar = illustration.user.avatar;
		this.authorId = illustration.user.id;
		this.authorName = illustration.user.username;
		this.id = illustration.id;
		this.imgList = illustration.imgList;
		this.cover = illustration.cover;
		this.name = illustration.name;
		this.isLiked = isLiked;
		this.createdAt = dayjs(illustration.createdTime).format('YYYY-MM-DD');
	}
}

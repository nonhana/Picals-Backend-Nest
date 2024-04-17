import type { Illustration } from 'src/apps/illustration/entities/illustration.entity';

export class IllustrationItemVO {
	authorAvatar: string;
	authorId: string;
	authorName: string;
	id: string;
	imgList: string[];
	name: string;
	isLiked: boolean;

	constructor(illustration: Illustration, isLiked: boolean) {
		this.authorAvatar = illustration.user.avatar;
		this.authorId = illustration.user.id;
		this.authorName = illustration.user.username;
		this.id = illustration.id;
		this.imgList = illustration.imgList;
		this.name = illustration.name;
		this.isLiked = isLiked;
	}
}

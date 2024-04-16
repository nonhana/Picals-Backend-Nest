import type { Illustration } from 'src/apps/illustration/entities/illustration.entity';

export class IllustrationItemVO {
	authorAvatar: string;
	authorId: string;
	authorName: string;
	id: string;
	imgList: string[];
	isLiked: boolean;
	name: string;

	constructor(illustration: Illustration) {}
}

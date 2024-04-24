import type { History } from '../entities/history.entity';

export class HistoryItemVo {
	id: string;
	authorAvatar: string;
	authorId: string;
	authorName: string;
	createdAt: string;
	imgList: string[];
	name: string;

	constructor(history: History) {
		this.id = history.id;
		this.authorAvatar = history.illustration.user.avatar;
		this.authorId = history.illustration.user.id;
		this.authorName = history.illustration.user.username;
		this.createdAt = history.lastTime.toISOString();
		this.imgList = history.illustration.imgList;
		this.name = history.illustration.name;
	}
}

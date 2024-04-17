import type { History } from 'src/apps/history/entities/history.entity';
import { formatDate } from 'src/utils';

export class HistoryItemVO {
	authorAvatar: string;
	authorId: string;
	authorName: string;
	createdAt: string;
	id: string;
	imgList: string[];
	name: string;

	constructor(history: History) {
		this.authorAvatar = history.illustration.user.avatar;
		this.authorId = history.illustration.user.id;
		this.authorName = history.illustration.user.username;
		this.createdAt = formatDate(history.lastTime);
		this.id = history.illustration.id;
		this.imgList = history.illustration.imgList;
		this.name = history.illustration.name;
	}
}

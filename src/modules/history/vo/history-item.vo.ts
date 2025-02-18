import type { History } from '../entities/history.entity';
import * as dayjs from 'dayjs';

export class HistoryItemVo {
	authorAvatar: string;
	authorId: string;
	authorName: string;
	id: string;
	imgList: string[];
	cover: string;
	name: string;
	lastTime: string;

	constructor(history: History) {
		this.authorAvatar = history.user.avatar;
		this.authorId = history.user.id;
		this.authorName = history.user.username;
		this.id = history.illustration.id;
		this.imgList = history.illustration.imgList;
		this.cover = history.illustration.cover;
		this.name = history.illustration.name;
		this.lastTime = dayjs(history.lastTime).format('YYYY-MM-DD');
	}
}

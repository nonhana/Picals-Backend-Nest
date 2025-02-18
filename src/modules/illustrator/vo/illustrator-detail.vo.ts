import type { Illustrator } from '../entities/illustrator.entity';

export class IllustratorDetailVo {
	id: string;
	avatar: string;
	createdAt: string;
	intro: string;
	name: string;
	updatedAt: string;
	workNum: number;
	homeUrl: string;

	constructor(illustrator: Illustrator) {
		this.id = illustrator.id;
		this.avatar = illustrator.avatar;
		this.createdAt = illustrator.createdTime.toISOString();
		this.intro = illustrator.intro;
		this.name = illustrator.name;
		this.updatedAt = illustrator.updatedTime.toISOString();
		this.workNum = illustrator.workCount;
		this.homeUrl = illustrator.homeUrl;
	}
}

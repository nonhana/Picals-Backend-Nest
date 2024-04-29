import type { Favorite } from '../entities/favorite.entity';

export class FavoriteDetailVo {
	id: string;
	cover: null | string;
	creatorId: string;
	creatorName: string;
	intro: string;
	name: string;
	workNum: number;

	constructor(favorite: Favorite) {
		this.id = favorite.id;
		this.name = favorite.name;
		this.intro = favorite.introduce;
		this.cover = favorite.cover;
		this.creatorId = favorite.user.id;
		this.creatorName = favorite.user.username;
		this.workNum = favorite.workCount;
	}
}

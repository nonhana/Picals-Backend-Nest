import type { Favorite } from 'src/apps/favorite/entities/favorite.entity';

export class FavoriteItemVo {
	cover: null | string;
	id: string;
	intro: string;
	name: string;
	order: number;
	workNum: number;

	constructor(favorite: Favorite) {
		this.cover = favorite.cover;
		this.id = favorite.id;
		this.intro = favorite.introduce;
		this.name = favorite.name;
		this.order = favorite.order;
		this.workNum = favorite.workCount;
	}
}

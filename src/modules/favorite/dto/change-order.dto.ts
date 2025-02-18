import { IsNotEmpty } from 'class-validator';

export class ChangeOrderDto {
	@IsNotEmpty({
		message: '收藏夹排序列表不能为空',
	})
	orderList: {
		id: string;
		order: number;
	}[];
}

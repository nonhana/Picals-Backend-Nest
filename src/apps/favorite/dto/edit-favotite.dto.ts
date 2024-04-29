import { Length, IsOptional, Matches } from 'class-validator';

export class EditFavoriteDto {
	@IsOptional()
	@Length(1, 31, {
		message: '收藏夹名称长度不能大于31',
	})
	name?: string;

	@IsOptional()
	@Length(1, 255, {
		message: '收藏夹简介长度不能大于255',
	})
	intro?: string;

	@IsOptional()
	@Matches(/(https?:\/\/.*\.(?:png|jpg))/, {
		message: '图片格式不正确，需要以http或https开头、以png或jpg结尾',
	})
	cover?: string;
}

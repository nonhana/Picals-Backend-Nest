import { Length, MaxLength, Matches, IsOptional } from 'class-validator';

export class EditIllustratorDto {
	@IsOptional()
	@Matches(/(https?:\/\/.*)/, {
		message: '主页地址格式不正确，需要以http或https开头',
	})
	homeUrl?: string;

	@IsOptional()
	@Length(1, 31, {
		message: '名字长度不能大于31',
	})
	name?: string;

	@IsOptional()
	@Matches(/(https?:\/\/.*\.(?:png|jpg))/, {
		message: '图片格式不正确，需要以http或https开头、以png或jpg结尾',
	})
	avatar?: string;

	@IsOptional()
	@MaxLength(255, {
		message: '简介长度不能大于255',
	})
	intro?: string;
}

import { IsNotEmpty, Length } from 'class-validator';

export class NewLabelDto {
	@IsNotEmpty({
		message: '标签名不能为空',
	})
	@Length(1, 31, {
		message: '标签名长度必须在1到31之间',
	})
	value: string;
}

import { Matches, Length, IsOptional, IsEmail, IsIn } from 'class-validator';

export class UpdateUserDto {
	@IsOptional()
	@IsEmail(
		{
			allow_ip_domain: false,
			allow_utf8_local_part: true,
			require_tld: true,
		},
		{
			message: '邮箱格式不正确',
		},
	)
	email?: string;

	@IsOptional()
	@Length(1, 31, {
		message: '用户名长度必须在1到31个字符之间',
	})
	username?: string;

	@IsOptional()
	@Length(1, 255, {
		message: '签名长度必须在1到255个字符之间',
	})
	signature?: string;

	@IsOptional()
	@Matches(/(https?:\/\/.*)/, {
		message: '头像地址格式不正确，需要以http或https开头',
	})
	avatar?: string;

	@IsOptional()
	@Matches(/(https?:\/\/.*)/, {
		message: '背景图片地址格式不正确，需要以http或https开头',
	})
	backgroundImg?: string;

	@IsOptional()
	@IsIn([0, 1, 2], {
		message: '性别只能是0, 1或2',
	})
	gender?: 0 | 1 | 2;
}

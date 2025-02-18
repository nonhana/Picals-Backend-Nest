import { IsEmail, IsNotEmpty, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
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
	@IsNotEmpty({
		message: '邮箱不能为空',
	})
	email: string;

	@Length(6, 6, {
		message: '验证码长度必须为6',
	})
	@IsNotEmpty({
		message: '验证码不能为空',
	})
	@Matches(/^\d{6}$/, {
		message: '验证码必须为数字',
	})
	verification_code: string;

	@MaxLength(31, {
		message: '密码长度不能大于31',
	})
	@MinLength(6, {
		message: '密码长度不能小于6',
	})
	@IsNotEmpty({
		message: '密码不能为空',
	})
	@Matches(/^(?=.*[A-Za-z])(?=.*\d)[\s\S]{6,}$/, {
		message: '密码必须包含字母和数字',
	})
	password: string;
}

import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail(
    {
      allow_ip_domain: false, // 是否允许ip作为域名
      allow_utf8_local_part: true, // 是否允许utf8作为本地部分
      require_tld: true, // 是否需要顶级域名
    },
    {
      message: '邮箱格式不正确',
    },
  )
  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  email: string;

  @MaxLength(31, {
    message: '密码长度不能大于31',
  })
  @MinLength(6, {
    message: '密码长度不能小于6',
  })
  @IsNotEmpty({
    message: '密码不能为空',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\s\S]{6,}$/, {
    message: '密码必须包含大小写字母和数字',
  })
  password: string;
}

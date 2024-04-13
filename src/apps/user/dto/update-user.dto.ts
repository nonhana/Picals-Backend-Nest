import { Matches, Length, IsOptional, IsEmail } from 'class-validator';

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
  @Matches(/(https?:\/\/.*\.(?:png|jpg))/, {
    message: '头像地址格式不正确，需要以http或https开头、以png或jpg结尾',
  })
  avatar?: string;

  @IsOptional()
  @Matches(/(https?:\/\/.*\.(?:png|jpg))/, {
    message: '背景图片地址格式不正确，需要以http或https开头、以png或jpg结尾',
  })
  backgroundImg?: string;
}

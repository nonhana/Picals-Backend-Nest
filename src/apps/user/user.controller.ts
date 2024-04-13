import { Controller, Post, Body, Inject, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto, RegisterUserDto, UpdateUserDto } from './dto';
import { hanaError } from 'src/error/hanaError';
import { errorMessages } from 'src/error/errorList';
import { RedisService } from 'src/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { UserDetailInfo } from './vo/detail.vo';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  @Get('/register-captcha') // 发送验证码
  async verification(@Query('email') email: string) {
    const code = Math.random().toString().slice(-6);

    if (await this.redisService.get(`sent_captcha_${email}`)) {
      throw new hanaError(10108, errorMessages.get(10108));
    }

    await this.redisService.set(`sent_captcha_${email}`, email, 60);
    await this.redisService.set(`captcha_${email}`, code, 60 * 5);

    await this.emailService.sendEmail({
      to: email,
      subject: '叮咚~这是注册验证码！',
      html: `<h1>您的验证码是：${code}，有效时间为5min，请尽快使用哦~！</h1>`,
    });

    return '验证码发送成功！';
  }

  @Get('/login') // 用户登录
  async login(@Query() loginUserDto: LoginUserDto) {
    const user = await this.userService.login(loginUserDto);
    if (user) {
      const token = await this.jwtService.signAsync({
        id: user.id,
        email: user.email,
        username: user.username,
      });
      return token;
    }
    throw new hanaError(10101, errorMessages.get(10101));
  }

  @Post('/register') // 用户注册
  async register(@Body() registerUserDto: RegisterUserDto) {
    const { email, verification_code, password } = registerUserDto;

    // 测试环境不需要验证码
    if (this.configService.get('NODE_ENV') === 'development') {
      if (verification_code !== this.configService.get('CAPTCHA_SECRET')) {
        throw new hanaError(10103, errorMessages.get(10103));
      }
      await this.userService.register(email, password);
      return '注册成功！';
    }

    const cacheCode = await this.redisService.get(`captcha_${email}`);
    if (!cacheCode || cacheCode !== verification_code) {
      throw new hanaError(10103, errorMessages.get(10103));
    }
    await this.userService.register(email, password);
    await this.redisService.del(`captcha_${email}`);
    await this.redisService.del(`sent_captcha_${email}`);
    return '注册成功！';
  }

  @Get('/detail') // 获取用户信息
  async getUserInfo(@Query('id') id: string) {
    const user = await this.userService.getUserInfo(id);
    const vo = new UserDetailInfo(user);
    return vo;
  }

  @Post('/update') // 更新用户信息
  async updateUserInfo(
    @Query('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.updateUserInfo(id, updateUserDto);
    return '更新成功！';
  }

  @Post('/update-password') // 更新用户密码
  async updatePassword(
    @Query('id') id: string,
    @Body('password') password: string,
    @Body('verification_code') verification_code: string,
  ) {
    const { email } = await this.userService.getUserInfo(id);

    if (this.configService.get('NODE_ENV') === 'development') {
      if (verification_code !== this.configService.get('CAPTCHA_SECRET')) {
        throw new hanaError(10103, errorMessages.get(10103));
      }
      await this.userService.updateUserPassword(id, password);
      return '注册成功！';
    }

    const cacheCode = await this.redisService.get(`captcha_${email}`);
    if (!cacheCode || cacheCode !== verification_code) {
      throw new hanaError(10103, errorMessages.get(10103));
    }
    await this.userService.updateUserPassword(id, password);
    await this.redisService.del(`captcha_${email}`);
    await this.redisService.del(`sent_captcha_${email}`);
    return '更新成功！';
  }

  @Post('/update-email') // 更新用户邮箱
  async updateEmail(
    @Query('id') id: string,
    @Body('email') email: string,
    @Body('verification_code') verification_code: string,
  ) {
    if (this.configService.get('NODE_ENV') === 'development') {
      if (verification_code !== this.configService.get('CAPTCHA_SECRET')) {
        throw new hanaError(10103, errorMessages.get(10103));
      }
      await this.userService.updateUserInfo(id, { email });
      return '更新成功！';
    }

    const cacheCode = await this.redisService.get(`captcha_${email}`);
    if (!cacheCode || cacheCode !== verification_code) {
      throw new hanaError(10103, errorMessages.get(10103));
    }
    await this.userService.updateUserInfo(id, { email });
    await this.redisService.del(`captcha_${email}`);
    await this.redisService.del(`sent_captcha_${email}`);
    return '更新成功！';
  }
}

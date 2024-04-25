import { Controller, Post, Body, Inject, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto, RegisterUserDto, UpdateUserDto } from './dto';
import { hanaError } from 'src/error/hanaError';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { DetailUserVo } from './vo/detail.vo';
import { LoginUserVo } from './vo/login.vo';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { JwtUserData } from 'src/guards/auth.guard';
import { RequireLogin, UserInfo } from 'src/decorators/login.decorator';
import { UserItemVo } from './vo/user-item.vo';
import { LabelItemVO } from '../label/vo/label-item.vo';
import { IllustrationItemVO } from '../illustration/vo/illustration-item.vo';
import { FavoriteItemVo } from './vo/favorite-item.vo';
import { HistoryItemVo } from '../history/vo/history-item.vo';

@Controller('user')
export class UserController {
	@Inject(UserService)
	private readonly userService: UserService;

	@Inject(JwtService)
	private readonly jwtService: JwtService;

	@Inject(CACHE_MANAGER)
	private readonly cacheManager: Cache;

	@Inject(ConfigService)
	private readonly configService: ConfigService;

	@Inject(EmailService)
	private readonly emailService: EmailService;

	@Get('register-captcha') // 发送验证码
	async verification(@Query('email') email: string) {
		const code = Math.random().toString().slice(-6);

		if (await this.cacheManager.get(`sent_captcha_${email}`)) {
			throw new hanaError(10108);
		}

		await this.cacheManager.set(`sent_captcha_${email}`, email, 1000 * 60);
		await this.cacheManager.set(`captcha_${email}`, code, 1000 * 60 * 5);

		await this.emailService.sendEmail({
			to: email,
			subject: '叮咚~这是注册验证码！',
			html: `<h1>您的验证码是：${code}，有效时间为5min，请尽快使用哦~！</h1>`,
		});

		return '验证码发送成功！';
	}

	@Get('login') // 用户登录
	async login(@Query() loginUserDto: LoginUserDto) {
		const user = await this.userService.login(loginUserDto);
		if (user) {
			const vo = new LoginUserVo();
			vo.userInfo = user;
			vo.accessToken = await this.jwtService.signAsync(
				{
					id: user.id,
					email: user.email,
					username: user.username,
				},
				{
					expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '30m',
				},
			);
			vo.refreshToken = await this.jwtService.signAsync(
				{ id: user.id },
				{
					expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME') || '7d',
				},
			);
			return vo;
		}
		throw new hanaError(10101);
	}

	@Get('refresh-token') // 刷新token，需前端配合实现无感刷新
	async refreshToken(@Query('refreshToken') refreshToken: string) {
		const { id } = this.jwtService.verify(refreshToken);
		const user = await this.userService.getInfo(id);

		const access_token = await this.jwtService.signAsync(
			{
				id: user.id,
				email: user.email,
				username: user.username,
			},
			{
				expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '30m',
			},
		);

		const refresh_token = await this.jwtService.signAsync(
			{ id: user.id },
			{
				expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME') || '7d',
			},
		);

		return {
			access_token,
			refresh_token,
		};
	}

	@Post('register') // 用户注册
	async register(@Body() registerUserDto: RegisterUserDto) {
		const { email, verification_code, password } = registerUserDto;

		// 测试环境不需要验证码
		if (this.configService.get('NODE_ENV') === 'development') {
			if (verification_code !== this.configService.get('CAPTCHA_SECRET')) {
				throw new hanaError(10103);
			}
			await this.userService.register(email, password);
			return '注册成功！';
		}

		const cacheCode = await this.cacheManager.get(`captcha_${email}`);
		if (!cacheCode || cacheCode !== verification_code) {
			throw new hanaError(10103);
		}
		await this.userService.register(email, password);
		await this.cacheManager.del(`captcha_${email}`);
		await this.cacheManager.del(`sent_captcha_${email}`);
		return '注册成功！';
	}

	@Get('detail') // 获取用户信息
	@RequireLogin()
	async getUserInfo(@Query('id') id: string) {
		const user = await this.userService.getInfo(id);
		const vo = new DetailUserVo(user);
		return vo;
	}

	@Post('update') // 更新用户信息
	@RequireLogin()
	async updateUserInfo(@UserInfo() userInfo: JwtUserData, @Body() updateUserDto: UpdateUserDto) {
		const { id } = userInfo;
		await this.userService.updateInfo(id, updateUserDto);
		return '更新成功！';
	}

	@Post('update-password') // 更新用户密码
	@RequireLogin()
	async updatePassword(
		@UserInfo() userInfo: JwtUserData,
		@Body('password') password: string,
		@Body('verification_code') verification_code: string,
	) {
		const { id } = userInfo;
		const { email } = await this.userService.getInfo(id);

		if (this.configService.get('NODE_ENV') === 'development') {
			if (verification_code !== this.configService.get('CAPTCHA_SECRET')) {
				throw new hanaError(10103);
			}
			await this.userService.updatePassword(id, password);
			return '注册成功！';
		}

		const cacheCode = await this.cacheManager.get(`captcha_${email}`);
		if (!cacheCode || cacheCode !== verification_code) {
			throw new hanaError(10103);
		}
		await this.userService.updatePassword(id, password);
		await this.cacheManager.del(`captcha_${email}`);
		await this.cacheManager.del(`sent_captcha_${email}`);
		return '更新成功！';
	}

	@Post('update-email') // 更新用户邮箱
	@RequireLogin()
	async updateEmail(
		@UserInfo() userInfo: JwtUserData,
		@Body('email') email: string,
		@Body('verification_code') verification_code: string,
	) {
		const { id } = userInfo;
		if (this.configService.get('NODE_ENV') === 'development') {
			if (verification_code !== this.configService.get('CAPTCHA_SECRET')) {
				throw new hanaError(10103);
			}
			await this.userService.updateInfo(id, { email });
			return '更新成功！';
		}

		const cacheCode = await this.cacheManager.get(`captcha_${email}`);
		if (!cacheCode || cacheCode !== verification_code) {
			throw new hanaError(10103);
		}
		await this.userService.updateInfo(id, { email });
		await this.cacheManager.del(`captcha_${email}`);
		await this.cacheManager.del(`sent_captcha_${email}`);
		return '更新成功！';
	}

	@Get('favorites') // 获取用户收藏夹
	@RequireLogin()
	async getFavorites(@UserInfo() userInfo: JwtUserData) {
		const { id } = userInfo;
		const favorites = await this.userService.getFavorites(id);
		return favorites.map((favorite) => new FavoriteItemVo(favorite));
	}

	@Get('history') // 分页获取用户的浏览记录
	@RequireLogin()
	async getHistory(
		@UserInfo() userInfo: JwtUserData,
		@Query('pageSize') pageSize: number,
		@Query('current') current: number,
	) {
		if (current <= 0) throw new hanaError(10201);
		if (pageSize <= 0) throw new hanaError(10202);
		const { id } = userInfo;
		const histories = await this.userService.getHistoryInPages(id, current, pageSize);
		return histories.map((history) => new HistoryItemVo(history));
	}

	@Get('like-labels') // 获取用户喜欢的标签列表
	@RequireLogin()
	async getLikeLabels(@UserInfo() userInfo: JwtUserData) {
		const { id } = userInfo;
		const labels = await this.userService.getLikeLabels(id);
		return labels.map((label) => new LabelItemVO(label));
	}

	@Post('like-label-actions') // 添加/取消喜欢标签
	@RequireLogin()
	async likeLabelActions(
		@UserInfo() userInfo: JwtUserData,
		@Body('id') id: string,
		@Body('type') type: number,
	) {
		const { id: userId } = userInfo;
		await this.userService.likeLabelActions(userId, id, type);
		return '操作成功！';
	}

	@Post('follow-action') // 关注/取关用户
	@RequireLogin()
	async followAction(
		@UserInfo() userInfo: JwtUserData,
		@Body('targetId') targetId: string,
		@Body('type') type: number,
	) {
		const { id } = userInfo;
		await this.userService.followAction(id, targetId, type);
		return '操作成功！';
	}

	@Get('following') // 分页获取用户的关注列表
	@RequireLogin()
	async getFollowing(
		@UserInfo() userInfo: JwtUserData,
		@Query('pageSize') pageSize: number,
		@Query('current') current: number,
	) {
		if (current <= 0) throw new hanaError(10201);
		if (pageSize <= 0) throw new hanaError(10202);
		const { id } = userInfo;
		const userList = await this.userService.getFollowingInPages(id, current, pageSize);

		return userList.map((user) => new UserItemVo(user, true));
	}

	@Get('following-count') // 获取用户的关注总数
	@RequireLogin()
	async getFollowingCount(@UserInfo() userInfo: JwtUserData) {
		const { id } = userInfo;
		return await this.userService.getFollowingCount(id);
	}

	@Get('followers') // 分页获取用户的粉丝列表
	@RequireLogin()
	async getFollowers(
		@UserInfo() userInfo: JwtUserData,
		@Query('pageSize') pageSize: number,
		@Query('current') current: number,
	) {
		if (current <= 0) throw new hanaError(10201);
		if (pageSize <= 0) throw new hanaError(10202);
		const { id } = userInfo;
		const userList = await this.userService.getFollowersInPages(id, current, pageSize);

		return await Promise.all(
			userList.map(
				async (user) => new UserItemVo(user, await this.userService.isFollowed(id, user.id)),
			),
		);
	}

	@Get('followers-count') // 获取用户的粉丝总数
	@RequireLogin()
	async getFollowersCount(@UserInfo() userInfo: JwtUserData) {
		const { id } = userInfo;
		return await this.userService.getFollowersCount(id);
	}

	@Get('published-labels') // 获取用户所有发布作品中携带的标签列表
	@RequireLogin()
	async getPublishedLabels(@UserInfo() userInfo: JwtUserData) {
		const { id } = userInfo;
		const labels = await this.userService.getPublishedLabels(id);
		return labels.map((label) => new LabelItemVO(label));
	}

	@Get('works') // 分页获取用户发布的作品列表
	@RequireLogin()
	async getWorks(
		@UserInfo() userInfo: JwtUserData,
		@Query('pageSize') pageSize: number,
		@Query('current') current: number,
	) {
		if (current <= 0) throw new hanaError(10201);
		if (pageSize <= 0) throw new hanaError(10202);
		const { id } = userInfo;
		const works = await this.userService.getWorksInPages(id, current, pageSize);
		return await Promise.all(
			works.map(
				async (work) => new IllustrationItemVO(work, await this.userService.isLiked(id, work.id)),
			),
		);
	}

	@Get('works-count') // 获取用户发布的作品总数
	@RequireLogin()
	async getWorksCount(@UserInfo() userInfo: JwtUserData) {
		const { id } = userInfo;
		return await this.userService.getWorksCount(id);
	}

	@Get('like-works') // 分页获取用户喜欢的作品列表
	@RequireLogin()
	async getLikeWorks(
		@UserInfo() userInfo: JwtUserData,
		@Query('pageSize') pageSize: number,
		@Query('current') current: number,
	) {
		if (current <= 0) throw new hanaError(10201);
		if (pageSize <= 0) throw new hanaError(10202);
		const { id } = userInfo;
		const works = await this.userService.getLikeWorksInPages(id, current, pageSize);
		return await Promise.all(
			works.map(
				async (work) => new IllustrationItemVO(work, await this.userService.isLiked(id, work.id)),
			),
		);
	}

	@Get('like-works-count') // 获取用户喜欢的作品总数
	@RequireLogin()
	async getLikeWorksCount(@UserInfo() userInfo: JwtUserData) {
		const { id } = userInfo;
		return await this.userService.getLikeWorksCount(id);
	}

	@Get('search') // 分页搜索用户
	@RequireLogin()
	async searchUser(
		@UserInfo() userInfo: JwtUserData,
		@Query('keyword') keyword: string,
		@Query('pageSize') pageSize: number,
		@Query('current') current: number,
	) {
		const { id } = userInfo;
		if (current <= 0) throw new hanaError(10201);
		if (pageSize <= 0) throw new hanaError(10202);
		const userList = await this.userService.searchUser(keyword, current, pageSize);
		return await Promise.all(
			userList.map(
				async (user) => new UserItemVo(user, await this.userService.isFollowed(id, user.id)),
			),
		);
	}

	@Get('search-count') // 搜索用户总数
	@RequireLogin()
	async searchUserCount(@Query('keyword') keyword: string) {
		return await this.userService.searchUserCount(keyword);
	}

	@Post('like') // 喜欢/取消喜欢作品
	@RequireLogin()
	async like(
		@UserInfo() userInfo: JwtUserData,
		@Body('id') workId: string,
		@Body('type') type: number,
	) {
		const { id } = userInfo;
		await this.userService.likeAction(id, workId, type);
		return '操作成功！';
	}

	@Post('collect') // 收藏/取消收藏作品
	@RequireLogin()
	async collect(
		@UserInfo() userInfo: JwtUserData,
		@Body('id') workId: string,
		@Body('favoriteId') favoriteId: string,
		@Body('type') type: number,
	) {
		const { id } = userInfo;
		await this.userService.collectAction(id, workId, favoriteId, type);
		return '操作成功！';
	}
}

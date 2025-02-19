import { Controller, Post, Body, Inject, Get, Query, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto, RegisterUserDto, UpdateUserDto } from './dto';
import { hanaError } from '@/common/error/hanaError';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@/infra/email/email.service';
import { DetailUserVo } from './vo/detail.vo';
import { LoginUserVo, userLoginInfoVo } from './vo/login.vo';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { JwtUserData } from '@/common/guards/auth.guard';
import { RequireLogin, UserInfo, AllowVisitor } from '@/common/decorators/login.decorator';
import { UserItemVo } from './vo/user-item.vo';
import { LabelItemVO } from '../label/vo/label-item.vo';
import { IllustrationItemVO } from '../illustration/vo/illustration-item.vo';
import { FavoriteItemVo } from '../favorite/vo/favorite-item.vo';

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
			vo.userInfo = new userLoginInfoVo(user);
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
		try {
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
		} catch {
			throw new UnauthorizedException('Token expired, please log in again');
		}
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

	@Get('detail') // 获取用户详细信息
	@AllowVisitor()
	async getUserInfo(@UserInfo() userInfo: JwtUserData, @Query('id') id: string) {
		const user = await this.userService.getInfo(id);
		return new DetailUserVo(
			user,
			userInfo ? await this.userService.isFollowed(userInfo.id, id) : false,
		);
	}

	@Get('simple') // 获取用户简略信息
	@AllowVisitor()
	async getUserSimpleInfo(@UserInfo() userInfo: JwtUserData, @Query('id') id: string) {
		const user = await this.userService.getSimpleInfo(id);
		const workLikeList: boolean[] = [];
		if (userInfo && user.illustrations) {
			for (const work of user.illustrations) {
				const status = await this.userService.isLiked(userInfo.id, work.id);
				workLikeList.push(status);
			}
		}
		return new UserItemVo(
			user,
			userInfo ? await this.userService.isFollowed(userInfo.id, id) : false,
			workLikeList,
		);
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
			return '更新成功！';
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

	@Get('favorites') // 获取某用户的收藏夹列表
	async getFavorites(@Query('id') id: string) {
		const favorites = await this.userService.getFavorites(id);
		return favorites.map((favorite) => new FavoriteItemVo(favorite));
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
	async likeLabelActions(@UserInfo() userInfo: JwtUserData, @Body('id') id: string) {
		const { id: userId } = userInfo;
		await this.userService.likeLabelActions(userId, id);
		return '操作成功！';
	}

	@Post('follow-action') // 关注/取关用户
	@RequireLogin()
	async followAction(@UserInfo() userInfo: JwtUserData, @Body('id') targetId: string) {
		const { id } = userInfo;
		await this.userService.followAction(id, targetId);
		return '操作成功！';
	}

	@Get('following') // 分页获取某用户的关注列表
	@AllowVisitor()
	async getFollowing(
		@UserInfo() userInfo: JwtUserData,
		@Query('id') id: string,
		@Query('pageSize') pageSize: number,
		@Query('current') current: number,
	) {
		if (current <= 0) throw new hanaError(10201);
		if (pageSize <= 0) throw new hanaError(10202);
		const records = await this.userService.getFollowingInPages(id, current, pageSize);

		return await Promise.all(
			records.map(async (record) => {
				const workLikeList: boolean[] = [];
				if (userInfo && record.following.illustrations) {
					for (const work of record.following.illustrations) {
						const status = await this.userService.isLiked(userInfo.id, work.id);
						workLikeList.push(status);
					}
				}
				return new UserItemVo(
					record.following,
					userInfo ? await this.userService.isFollowed(userInfo.id, record.following.id) : false,
					workLikeList,
				);
			}),
		);
	}

	@Get('following-count') // 获取用户的关注总数
	async getFollowingCount(@Query('id') id: string) {
		return await this.userService.getFollowingCount(id);
	}

	@Get('followers') // 分页获取用户的粉丝列表
	@AllowVisitor()
	async getFollowers(
		@UserInfo() userInfo: JwtUserData,
		@Query('id') id: string,
		@Query('pageSize') pageSize: number,
		@Query('current') current: number,
	) {
		if (current <= 0) throw new hanaError(10201);
		if (pageSize <= 0) throw new hanaError(10202);
		const records = await this.userService.getFollowersInPages(id, current, pageSize);

		return await Promise.all(
			records.map(async (record) => {
				const workLikeList: boolean[] = [];
				if (userInfo && record.follower.illustrations) {
					for (const work of record.follower.illustrations) {
						const status = await this.userService.isLiked(userInfo.id, work.id);
						workLikeList.push(status);
					}
				}
				return new UserItemVo(
					record.follower,
					userInfo ? await this.userService.isFollowed(userInfo.id, record.follower.id) : false,
					workLikeList,
				);
			}),
		);
	}

	@Get('followers-count') // 获取某用户的粉丝总数
	async getFollowersCount(@Query('id') id: string) {
		return await this.userService.getFollowersCount(id);
	}

	@Get('published-labels') // 获取用户所有发布作品中携带的标签列表
	async getPublishedLabels(@Query('id') id: string) {
		const labels = await this.userService.getPublishedLabels(id);
		return labels.map((label) => new LabelItemVO(label));
	}

	@Get('works') // 分页获取用户发布的作品列表
	@AllowVisitor()
	async getWorks(
		@UserInfo() userInfo: JwtUserData,
		@Query('id') id: string,
		@Query('pageSize') pageSize: number,
		@Query('current') current: number,
	) {
		if (current <= 0) throw new hanaError(10201);
		if (pageSize <= 0) throw new hanaError(10202);
		const works = await this.userService.getWorksInPages(id, current, pageSize);
		return await Promise.all(
			works.map(
				async (work) =>
					new IllustrationItemVO(
						work,
						userInfo ? await this.userService.isLiked(userInfo.id, work.id) : false,
					),
			),
		);
	}

	@Get('works-id') // 获取用户发布的全部作品的id列表
	async getWorksId(@Query('id') id: string) {
		return await this.userService.getWorksId(id);
	}

	@Get('works-count') // 获取用户发布的作品总数
	async getWorksCount(@Query('id') id: string) {
		return await this.userService.getWorksCount(id);
	}

	@Get('like-works') // 分页获取用户喜欢的作品列表
	@AllowVisitor()
	async getLikeWorks(
		@UserInfo() userInfo: JwtUserData,
		@Query('id') id: string,
		@Query('pageSize') pageSize: number,
		@Query('current') current: number,
	) {
		if (current <= 0) throw new hanaError(10201);
		if (pageSize <= 0) throw new hanaError(10202);
		const results = await this.userService.getLikeWorksInPages(id, current, pageSize);
		return await Promise.all(
			results.map(
				async (item) =>
					new IllustrationItemVO(
						item.illustration,
						userInfo ? await this.userService.isLiked(userInfo.id, item.illustration.id) : false,
					),
			),
		);
	}

	@Get('like-works-id') // 获取用户喜欢的作品id列表
	async getLikeWorksId(@Query('id') id: string) {
		return await this.userService.getLikeWorksId(id);
	}

	@Get('like-works-count') // 获取用户喜欢的作品总数
	async getLikeWorksCount(@Query('id') id: string) {
		return await this.userService.getLikeWorksCount(id);
	}

	@Get('search') // 分页搜索用户
	@AllowVisitor()
	async searchUser(
		@UserInfo() userInfo: JwtUserData,
		@Query('keyword') keyword: string,
		@Query('pageSize') pageSize: number,
		@Query('current') current: number,
	) {
		if (current <= 0) throw new hanaError(10201);
		if (pageSize <= 0) throw new hanaError(10202);
		const userList = await this.userService.searchUser(keyword, current, pageSize);
		return await Promise.all(
			userList.map(async (user) => {
				const workLikeList: boolean[] = [];
				if (userInfo && user.illustrations) {
					for (const work of user.illustrations) {
						const status = await this.userService.isLiked(userInfo.id, work.id);
						workLikeList.push(status);
					}
				}
				return new UserItemVo(
					user,
					userInfo ? await this.userService.isFollowed(userInfo.id, user.id) : false,
					workLikeList,
				);
			}),
		);
	}

	@Get('search-count') // 搜索用户总数
	async searchUserCount(@Query('keyword') keyword: string) {
		return await this.userService.searchUserCount(keyword);
	}

	@Post('like') // 喜欢/取消喜欢作品
	@RequireLogin()
	async like(@UserInfo() userInfo: JwtUserData, @Body('id') workId: string) {
		const { id } = userInfo;
		await this.userService.likeAction(id, workId);
		return '操作成功！';
	}

	@Post('collect') // 收藏/取消收藏作品
	@RequireLogin()
	async collect(
		@UserInfo() userInfo: JwtUserData,
		@Body('id') workId: string,
		@Body('favoriteIds') favoriteIds: string[],
	) {
		const { id } = userInfo;
		await this.userService.collectAction(id, workId, favoriteIds);
		return '操作成功！';
	}

	@Get('recommend-user') // 分页获取推荐用户列表
	@AllowVisitor()
	async getRecommendUser(
		@UserInfo() userInfo: JwtUserData,
		@Query('id') tempId: string,
		@Query('pageSize') pageSize: number = 1,
		@Query('current') current: number = 6,
	) {
		const userList = await this.userService.getRecommendUserInPages(
			current,
			pageSize,
			userInfo ? userInfo.id : tempId,
		);
		return await Promise.all(
			userList.map(async (user) => {
				const workLikeList: boolean[] = [];
				if (userInfo && user.illustrations) {
					for (const work of user.illustrations) {
						const status = await this.userService.isLiked(userInfo.id, work.id);
						workLikeList.push(status);
					}
				}
				return new UserItemVo(
					user,
					userInfo ? await this.userService.isFollowed(userInfo.id, user.id) : false,
					workLikeList,
				);
			}),
		);
	}
}

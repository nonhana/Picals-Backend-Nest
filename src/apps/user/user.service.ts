import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { verifyPassword, hashPassword } from 'src/utils';
import { hanaError } from 'src/error/hanaError';
import type { UpdateUserDto, LoginUserDto } from './dto';
import { History } from '../history/entities/history.entity';
import { LabelService } from '../label/label.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Illustration } from '../illustration/entities/illustration.entity';
import type { Label } from '../label/entities/label.entity';
import { FavoriteService } from '../favorite/favorite.service';
import { Favorite } from '../favorite/entities/favorite.entity';

@Injectable()
export class UserService {
	@Inject(CACHE_MANAGER)
	private readonly cacheManager: Cache;

	@Inject(LabelService)
	private readonly labelService: LabelService;

	@Inject(FavoriteService)
	private readonly favoriteService: FavoriteService;

	@InjectRepository(User)
	private readonly userRepository: Repository<User>;

	@InjectRepository(History)
	private readonly historyRepository: Repository<History>;

	@InjectRepository(Illustration)
	private readonly illustrationRepository: Repository<Illustration>;

	@InjectRepository(Favorite)
	private readonly favoriteRepository: Repository<Favorite>;

	// 根据 email 查找单个用户
	async findUserByEmail(email: string) {
		return await this.userRepository.findOne({ where: { email } });
	}

	// 根据 id 查找单个用户
	async findUserById(id: string, relations?: string[]) {
		return await this.userRepository.findOne({ where: { id }, relations: relations || [] });
	}

	// 用户登录
	async login(loginUserDto: LoginUserDto) {
		const user = await this.findUserByEmail(loginUserDto.email);
		if (!user) throw new hanaError(10101);
		const compareResult = await verifyPassword(loginUserDto.password, user.password);
		if (!compareResult) throw new hanaError(10102);
		return user;
	}

	// 用户注册
	async register(email: string, password: string) {
		if (await this.findUserByEmail(email)) throw new hanaError(10105);
		const user = new User();
		user.email = email;
		user.password = await hashPassword(password);
		await this.userRepository.save(user);
		return;
	}

	// 获取单个用户信息
	async getInfo(id: string) {
		const user = await this.findUserById(id);
		if (!user) throw new hanaError(10101);
		return user;
	}

	// 获取单个用户简要信息
	async getSimpleInfo(id: string) {
		const queryBuilder = this.userRepository.createQueryBuilder('user');
		queryBuilder.where('user.id = :id', { id });

		return await queryBuilder.getOne();
	}

	// 更新用户信息
	async updateInfo(id: string, updateUserDto: UpdateUserDto) {
		if (!(await this.findUserById(id))) throw new hanaError(10101);
		await this.userRepository.save({ id, ...updateUserDto });
		return;
	}

	// 更新用户密码
	async updatePassword(id: string, password: string) {
		if (!(await this.findUserById(id))) throw new hanaError(10101);
		await this.userRepository.save({
			id,
			password: await hashPassword(password),
		});
		return;
	}

	// 获取用户的所有收藏夹列表
	async getFavorites(id: string) {
		return await this.favoriteRepository.find({ where: { user: { id } } });
	}

	// 分页获取用户的历史记录
	async getHistoryInPages(id: string, current: number, pageSize: number) {
		const user = await this.findUserById(id);
		if (!user) throw new hanaError(10101);

		const queryBuilder = this.historyRepository.createQueryBuilder('history');
		queryBuilder.where('history.user = :user', { user });
		queryBuilder.leftJoinAndSelect('history.illustration', 'illustration');
		queryBuilder.orderBy('history.lastTime', 'DESC');

		queryBuilder.skip((current - 1) * pageSize);
		queryBuilder.take(pageSize);

		return await queryBuilder.getMany();
	}

	// 获取用户喜欢的标签列表
	async getLikeLabels(id: string) {
		const user = await this.findUserById(id, ['likedLabels']);
		if (!user) throw new hanaError(10101);
		return user.likedLabels;
	}

	// 添加/移除喜欢的标签
	async likeLabelActions(userId: string, labelId: string) {
		const user = await this.findUserById(userId, ['likedLabels']);
		if (!user) throw new hanaError(10101);

		const isExist = user.likedLabels.some((label) => label.id === labelId); // 查找用户是否已经喜欢了该标签

		if (isExist) {
			user.likedLabels = user.likedLabels.filter((label) => label.id !== labelId);
		} else {
			const label = await this.labelService.findItemById(labelId);
			if (!label) throw new hanaError(10403);
			user.likedLabels.push(label);
		}

		await this.userRepository.save(user);
	}

	// 判断用户是否关注了目标用户
	async isFollowed(userId: string, targetId: string) {
		const cacheKey = `user_following_${userId}`;
		let following = (await this.cacheManager.get(cacheKey)) as User[] | null;

		if (!following) {
			const user = await this.findUserById(userId, ['following']);
			if (!user) throw new hanaError(10101);
			following = user.following;
			await this.cacheManager.set(cacheKey, following, 1000);
		}

		return following.some((item) => item.id === targetId);
	}

	// 关注/取关用户
	async followAction(userId: string, targetId: string) {
		if (userId === targetId) throw new hanaError(10112);

		const user = await this.findUserById(userId, ['following']);
		const target = await this.findUserById(targetId);
		if (!user) throw new hanaError(10101);
		if (!target) throw new hanaError(10101);

		const isFollowed = await this.isFollowed(userId, targetId);

		console.log('123123213123213123123123', user.following);

		if (isFollowed) {
			user.following = user.following.filter((item) => item.id !== targetId);
			user.followCount--;
			target.fanCount--;
		} else {
			user.following.push(target);
			user.followCount++;
			target.fanCount++;
		}

		await this.userRepository.save(user);
		await this.userRepository.save(target);
	}

	// 分页获取用户正在关注的用户列表
	async getFollowingInPages(id: string, current: number, pageSize: number) {
		const user = await this.findUserById(id);
		if (!user) throw new hanaError(10101);

		const queryBuilder = this.userRepository.createQueryBuilder('user');
		queryBuilder.innerJoin('user.followers', 'follower', 'follower.id = :id', { id });
		queryBuilder.leftJoin('user.illustrations', 'illustration');
		queryBuilder.addSelect('illustration.id');

		queryBuilder.skip((current - 1) * pageSize);
		queryBuilder.take(pageSize);

		return await queryBuilder.getMany();
	}

	// 获取用户的关注用户总数
	async getFollowingCount(id: string) {
		const user = await this.findUserById(id, ['following']);
		if (!user) throw new hanaError(10101);
		return user.following.length;
	}

	// 分页获取用户的粉丝列表
	async getFollowersInPages(id: string, current: number, pageSize: number) {
		const user = await this.findUserById(id);
		if (!user) throw new hanaError(10101);

		const queryBuilder = this.userRepository.createQueryBuilder('user');
		queryBuilder.innerJoin('user.following', 'following', 'following.id = :id', { id });
		queryBuilder.leftJoin('user.illustrations', 'illustration');
		queryBuilder.addSelect('illustration.id');

		queryBuilder.skip((current - 1) * pageSize);
		queryBuilder.take(pageSize);

		return await queryBuilder.getMany();
	}

	// 获取用户的全部粉丝列表
	async getFollowers(id: string) {
		const user = await this.findUserById(id, ['followers']);
		if (!user) throw new hanaError(10101);
		return user.followers;
	}

	// 获取用户的粉丝总数
	async getFollowersCount(id: string) {
		const user = await this.findUserById(id, ['followers']);
		if (!user) throw new hanaError(10101);
		return user.followers.length;
	}

	// 获取用户发布的全部作品中的标签列表
	async getPublishedLabels(id: string) {
		const user = await this.findUserById(id);
		if (!user) throw new hanaError(10101);

		// 1. 先获取用户发布的全部作品的 id
		const queryBuilder = this.illustrationRepository.createQueryBuilder('illustration');
		queryBuilder.innerJoin('illustration.user', 'user', 'user.id = :id', { id });
		queryBuilder.select('illustration.id');

		const illustrations = await queryBuilder.getMany();

		// 2. 获取全部作品的标签列表，返回结果应当是一个去重的数组
		const idSet: Set<string> = new Set();
		const result: Label[] = [];
		for (const illustration of illustrations) {
			const labels = await this.labelService.getItemsByIllustrationId(illustration.id);
			for (const label of labels) {
				if (!idSet.has(label.id)) {
					idSet.add(label.id);
					result.push(label);
				}
			}
		}

		return result;
	}

	// 分页获取用户发布的作品列表
	async getWorksInPages(id: string, current: number, pageSize: number) {
		return await this.illustrationRepository.find({
			where: { user: { id } },
			relations: ['user'],
			skip: (current - 1) * pageSize,
			take: pageSize,
		});
	}

	// 判断用户是否喜欢了某个插画
	async isLiked(userId: string, illustrationId: string) {
		const cacheKey = `user_like_${userId}`;
		let likeList = (await this.cacheManager.get(cacheKey)) as Illustration[] | null;

		if (!likeList) {
			const user = await this.findUserById(userId, ['likeWorks']);
			if (!user) throw new hanaError(10101);
			likeList = user.likeWorks;
			await this.cacheManager.set(cacheKey, likeList, 1000);
		}

		const res = likeList.some((item) => item.id === illustrationId);

		return res;
	}

	// 判断用户是否收藏了某个插画
	async isCollected(userId: string, illustrationId: string) {
		const cacheKey = `user_collect_${userId}`;
		let collectList = (await this.cacheManager.get(cacheKey)) as string[] | null; // 收藏插画的id列表

		if (!collectList) {
			collectList = await this.favoriteService.getFavoriteRecords(userId);
			await this.cacheManager.set(cacheKey, collectList, 1000);
		}

		return collectList.some((item) => item === illustrationId);
	}

	// 获取用户发布的作品总数
	async getWorksCount(id: string) {
		const user = await this.findUserById(id, ['illustrations']);
		if (!user) throw new hanaError(10101);
		return user.illustrations.length;
	}

	// 分页获取用户喜欢的作品列表
	async getLikeWorksInPages(id: string, current: number, pageSize: number) {
		const user = await this.findUserById(id);
		if (!user) throw new hanaError(10101);

		return await this.illustrationRepository.find({
			where: { likeUsers: { id } },
			relations: ['user'],
			skip: (current - 1) * pageSize,
			take: pageSize,
		});
	}

	// 获取用户喜欢的作品总数
	async getLikeWorksCount(id: string) {
		const user = await this.findUserById(id, ['likeWorks']);
		if (!user) throw new hanaError(10101);
		return user.likeWorks.length;
	}

	// 分页搜索用户
	async searchUser(keyword: string, current: number, pageSize: number) {
		const queryBuilder = this.userRepository.createQueryBuilder('user');
		queryBuilder.where('user.username like :keyword', { keyword: `%${keyword}%` });

		queryBuilder.skip((current - 1) * pageSize);
		queryBuilder.take(pageSize);

		return await queryBuilder.getMany();
	}

	// 获取搜索到的用户总数
	async searchUserCount(keyword: string) {
		const queryBuilder = this.userRepository.createQueryBuilder('user');
		queryBuilder.where('user.username like :keyword', { keyword: `%${keyword}%` });

		return await queryBuilder.getCount();
	}

	// 喜欢/取消喜欢作品
	async likeAction(userId: string, workId: string) {
		const user = await this.findUserById(userId, ['likeWorks']);
		if (!user) throw new hanaError(10101);

		const illustration = await this.illustrationRepository.findOne({ where: { id: workId } });
		if (!illustration) throw new hanaError(10501);

		const isLiked = await this.isLiked(userId, workId);

		if (isLiked) {
			user.likeWorks = user.likeWorks.filter((item) => item.id !== workId);
			user.likeCount--;
			illustration.likeCount--;
		} else {
			user.likeWorks.push(illustration);
			user.likeCount++;
			illustration.likeCount++;
		}

		await this.illustrationRepository.save(illustration);
		await this.userRepository.save(user);
		return;
	}

	// 收藏/取消收藏作品
	async collectAction(userId: string, workId: string, favoriteId: string) {
		const illustration = await this.illustrationRepository.findOne({ where: { id: workId } });
		if (!illustration) throw new hanaError(10501);

		const favorite = await this.favoriteRepository.findOne({
			where: { id: favoriteId, user: { id: userId } },
			relations: ['illustrations'],
		});
		if (!favorite) throw new hanaError(10601);

		const isCollected = await this.isCollected(userId, workId);

		if (isCollected) {
			favorite.illustrations = favorite.illustrations.filter((item) => item.id !== workId);
			favorite.workCount--;
			illustration.collectCount--;
			await this.favoriteService.removeFavoriteRecord(userId, workId);
		} else {
			favorite.illustrations.push(illustration);
			favorite.workCount++;
			illustration.collectCount++;
			await this.favoriteService.addFavoriteRecord(userId, workId);
		}

		await this.illustrationRepository.save(illustration);
		await this.favoriteRepository.save(favorite);
		return;
	}

	// 分页获取推荐用户列表
	async getRecommendUserInPages(current: number, pageSize: number) {
		const queryBuilder = this.userRepository.createQueryBuilder('user');
		queryBuilder.leftJoin('user.illustrations', 'illustration');
		queryBuilder.addSelect('illustration.id');
		queryBuilder.orderBy('RAND()');
		queryBuilder.skip((current - 1) * pageSize);
		queryBuilder.take(pageSize);

		return await queryBuilder.getMany();
	}
}

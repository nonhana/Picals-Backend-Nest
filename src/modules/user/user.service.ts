import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { verifyPassword, hashPassword, downloadFile, suffixGenerator } from 'src/utils';
import { hanaError } from 'src/error/hanaError';
import type { UpdateUserDto, LoginUserDto } from './dto';
import { LabelService } from '../label/label.service';
import { Illustration } from '../illustration/entities/illustration.entity';
import type { Label } from '../label/entities/label.entity';
import { FavoriteService } from '../favorite/favorite.service';
import { Favorite } from '../favorite/entities/favorite.entity';
import { WorkPushTemp } from '../illustration/entities/work-push-temp.entity';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { LikeWorks } from './entities/like-works.entity';
import { Follow } from './entities/follow.entity';
import { ImgHandlerService } from 'src/img-handler/img-handler.service';

@Injectable()
export class UserService {
	@Inject(CACHE_MANAGER)
	private readonly cacheManager: Cache;

	@Inject(LabelService)
	private readonly labelService: LabelService;

	@Inject(FavoriteService)
	private readonly favoriteService: FavoriteService;

	@Inject(ImgHandlerService)
	private readonly imgHandlerService: ImgHandlerService;

	@InjectRepository(User)
	private readonly userRepository: Repository<User>;

	@InjectRepository(Illustration)
	private readonly illustrationRepository: Repository<Illustration>;

	@InjectRepository(Favorite)
	private readonly favoriteRepository: Repository<Favorite>;

	@InjectRepository(WorkPushTemp)
	private readonly workTempRepository: Repository<WorkPushTemp>;

	@InjectRepository(LikeWorks)
	private readonly likeWorksRepository: Repository<LikeWorks>;

	@InjectRepository(Follow)
	private readonly followRepository: Repository<Follow>;

	// 根据 email 查找单个用户
	async findUserByEmail(email: string, relations?: string[]) {
		return await this.userRepository.findOne({ where: { email }, relations: relations || [] });
	}

	// 根据 id 查找单个用户
	async findUserById(id: string, relations?: string[]) {
		return await this.userRepository.findOne({ where: { id }, relations: relations || [] });
	}

	// 用户登录
	async login(loginUserDto: LoginUserDto) {
		const user = await this.findUserByEmail(loginUserDto.email, ['likedLabels']);
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

		if (updateUserDto.avatar) {
			const imgBuffer = await downloadFile(updateUserDto.avatar);
			const fileName = suffixGenerator('little-avatar.jpg');
			const thumbnail = (await this.imgHandlerService.generateThumbnail(
				imgBuffer,
				fileName,
				'avatar',
			)) as string;
			await this.userRepository.save({ id, littleAvatar: thumbnail, ...updateUserDto });
			return;
		}

		if (updateUserDto.backgroundImg) {
			const imgBuffer = await downloadFile(updateUserDto.backgroundImg);
			const fileName = suffixGenerator('background.jpg');
			const thumbnail = (await this.imgHandlerService.generateThumbnail(
				imgBuffer,
				fileName,
				'background',
			)) as string;
			await this.userRepository.save({ id, backgroundImg: thumbnail, ...updateUserDto });
			return;
		}

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
		return await this.favoriteService.getFavoriteList(id);
	}

	// 获取用户喜欢的标签列表
	async getLikeLabels(id: string) {
		const user = await this.findUserById(id, ['likedLabels']);
		if (!user) throw new hanaError(10101);
		return user.likedLabels;
	}

	// 判断用户是否已经喜欢该标签
	async isLikedLabel(userId: string, labelId: string) {
		const user = await this.findUserById(userId, ['likedLabels']);
		if (!user) throw new hanaError(10101);
		return user.likedLabels.some((label) => label.id === labelId);
	}

	// 添加/移除喜欢的标签
	async likeLabelActions(userId: string, labelId: string) {
		const user = await this.findUserById(userId, ['likedLabels']);
		if (!user) throw new hanaError(10101);

		const isExist = await this.isLikedLabel(userId, labelId);

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
		const followRelation = await this.followRepository.findOne({
			where: { follower: { id: userId }, following: { id: targetId } },
		});
		return !!followRelation;
	}

	// 关注/取关用户
	async followAction(userId: string, targetId: string) {
		if (userId === targetId) throw new hanaError(10112);

		const user = await this.findUserById(userId);
		const target = await this.findUserById(targetId);

		if (!user) throw new hanaError(10101);
		if (!target) throw new hanaError(10101);

		const followRelation = await this.followRepository.findOne({
			where: { follower: { id: userId }, following: { id: targetId } },
		});

		if (followRelation) {
			await this.followRepository.remove(followRelation);
			user.followCount--;
			target.fanCount--;
			// 取消关注，删除用户的作品推送
			await this.workTempRepository.delete({ author: target, user });
		} else {
			const newFollowRelation = new Follow();
			newFollowRelation.follower = user;
			newFollowRelation.following = target;
			await this.followRepository.save(newFollowRelation);

			user.followCount++;
			target.fanCount++;
			// 关注用户，将用户的作品的前十个推送到关注用户的作品推送表中
			const illustrations = await this.illustrationRepository.find({
				where: { user: { id: targetId } },
				order: { createdTime: 'DESC' },
				take: 10,
			});
			illustrations.forEach(async (work) => {
				await this.workTempRepository.save({
					author: target,
					user,
					illustration: work,
				});
			});
		}

		await this.userRepository.save(user);
		await this.userRepository.save(target);
	}

	// 分页获取用户正在关注的用户列表
	async getFollowingInPages(id: string, current: number, pageSize: number) {
		const user = await this.findUserById(id);
		if (!user) throw new hanaError(10101);

		const followings = await this.followRepository
			.createQueryBuilder('follow')
			.leftJoinAndSelect('follow.following', 'following')
			.where('follow.follower = :id', { id })
			.orderBy('follow.followTime', 'DESC')
			.skip((current - 1) * pageSize)
			.take(pageSize)
			.getMany();

		for (const follow of followings) {
			const latestIllustrations = await this.illustrationRepository.find({
				where: { user: { id: follow.following.id } },
				relations: ['user'],
				order: { createdTime: 'DESC' },
				take: 4,
			});

			follow.following.illustrations = latestIllustrations;
		}

		return followings;
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

		const followers = await this.followRepository
			.createQueryBuilder('follow')
			.leftJoinAndSelect('follow.follower', 'follower')
			.where('follow.following = :id', { id })
			.orderBy('follow.followTime', 'DESC')
			.skip((current - 1) * pageSize)
			.take(pageSize)
			.getMany();

		for (const follow of followers) {
			const latestIllustrations = await this.illustrationRepository.find({
				where: { user: { id: follow.follower.id } },
				relations: ['user'],
				order: { createdTime: 'DESC' },
				take: 4,
			});

			follow.follower.illustrations = latestIllustrations;
		}

		return followers;
	}

	// 获取用户的全部粉丝列表
	async getFollowers(id: string) {
		return await this.followRepository.find({
			where: { following: { id } },
			relations: ['follower'],
		});
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

		// 3. 从中随机取 20 个标签返回，如果不到 20 个则全部返回
		if (result.length > 20) {
			const randomResult: Label[] = [];
			while (randomResult.length < 20) {
				const randomIndex = Math.floor(Math.random() * result.length);
				randomResult.push(result[randomIndex]);
				result.splice(randomIndex, 1);
			}
			return randomResult;
		}

		return result;
	}

	// 分页获取用户发布的作品列表
	async getWorksInPages(id: string, current: number, pageSize: number) {
		return await this.illustrationRepository.find({
			where: { user: { id } },
			relations: ['user'],
			order: { createdTime: 'DESC' },
			skip: (current - 1) * pageSize,
			take: pageSize,
		});
	}

	// 获取用户发布的全部作品的id列表
	async getWorksId(id: string) {
		const results = await this.illustrationRepository.find({
			where: { user: { id } },
			order: { createdTime: 'DESC' },
		});
		return results.map((item) => item.id);
	}

	// 判断用户是否喜欢了某个插画
	async isLiked(userId: string, illustrationId: string) {
		const likedWorks = await this.likeWorksRepository.find({
			where: { user: { id: userId }, illustration: { id: illustrationId } },
		});
		return likedWorks.length > 0;
	}

	// 判断用户是否收藏了某个插画
	async isCollected(userId: string, illustrationId: string) {
		const collectList = await this.favoriteService.getFavoriteRecords(userId, illustrationId);
		return collectList.length > 0;
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

		return await this.likeWorksRepository.find({
			where: { user: { id } },
			relations: ['illustration', 'illustration.user'],
			order: { likeTime: 'DESC' },
			skip: (current - 1) * pageSize,
			take: pageSize,
		});
	}

	// 获取用户喜欢的作品的id列表
	async getLikeWorksId(id: string) {
		const results = await this.likeWorksRepository.find({
			where: { user: { id } },
			relations: ['illustration'],
			order: { likeTime: 'DESC' },
		});
		return results.map((item) => item.illustration.id);
	}

	// 获取用户喜欢的作品总数
	async getLikeWorksCount(id: string) {
		const user = await this.findUserById(id, ['likeWorks']);
		if (!user) throw new hanaError(10101);
		return user.likeWorks.length;
	}

	// 分页搜索用户
	async searchUser(keyword: string, current: number, pageSize: number) {
		const users = await this.userRepository
			.createQueryBuilder('user')
			.where('user.username like :keyword', { keyword: `%${keyword}%` })
			.skip((current - 1) * pageSize)
			.take(pageSize)
			.getMany();

		for (const user of users) {
			const latestIllustrations = await this.illustrationRepository.find({
				where: { user: { id: user.id } },
				relations: ['user'],
				order: { createdTime: 'DESC' },
				take: 4,
			});

			user.illustrations = latestIllustrations;
		}

		return users;
	}

	// 获取搜索到的用户总数
	async searchUserCount(keyword: string) {
		const queryBuilder = this.userRepository.createQueryBuilder('user');
		queryBuilder.where('user.username like :keyword', { keyword: `%${keyword}%` });

		return await queryBuilder.getCount();
	}

	// 喜欢/取消喜欢作品
	async likeAction(userId: string, workId: string) {
		const user = await this.findUserById(userId);
		if (!user) throw new Error('User not found');

		const illustration = await this.illustrationRepository.findOne({ where: { id: workId } });
		if (!illustration) throw new Error('Illustration not found');

		const likeRelation = await this.likeWorksRepository.findOne({
			where: { user: { id: userId }, illustration: { id: workId } },
		});

		if (likeRelation) {
			await this.likeWorksRepository.remove(likeRelation);
			user.likeCount--;
			illustration.likeCount--;
		} else {
			const newLikeRelation = new LikeWorks();
			newLikeRelation.user = user;
			newLikeRelation.illustration = illustration;
			await this.likeWorksRepository.save(newLikeRelation);

			user.likeCount++;
			illustration.likeCount++;
		}

		await this.userRepository.save(user);
		await this.illustrationRepository.save(illustration);
		return;
	}

	// 收藏/取消收藏作品
	async collectAction(userId: string, workId: string, favoriteIds: string[]) {
		const user = await this.findUserById(userId);
		if (!user) throw new hanaError(10101);

		const illustration = await this.illustrationRepository.findOne({
			where: { id: workId },
			relations: ['favorites'],
		});
		if (!illustration) throw new hanaError(10501);

		const needAddFavoritesIds = favoriteIds.filter(
			(id) => !illustration.favorites.some((item) => item.id === id),
		);
		const needAddFavorites = await this.favoriteRepository.find({
			where: { id: In(needAddFavoritesIds), user: { id: userId } },
			relations: ['illustrations'],
		});

		const needRemoveFavoritesIds = illustration.favorites.filter(
			(item) => !favoriteIds.some((id) => item.id === id),
		);
		const needRemoveFavorites = await this.favoriteRepository.find({
			where: { id: In(needRemoveFavoritesIds.map((item) => item.id)), user: { id: userId } },
			relations: ['illustrations'],
		});

		for (const addFavorite of needAddFavorites) {
			addFavorite.illustrations.push(illustration);
			user.collectCount++;
			addFavorite.workCount++;
			illustration.collectCount++;
			await this.favoriteService.addFavoriteRecord(userId, workId, addFavorite.id);
		}

		for (const removeFavorite of needRemoveFavorites) {
			removeFavorite.illustrations = removeFavorite.illustrations.filter(
				(item) => item.id !== workId,
			);
			user.collectCount--;
			removeFavorite.workCount--;
			illustration.collectCount--;
			await this.favoriteService.removeFavoriteRecord(userId, workId, removeFavorite.id);
		}

		await this.userRepository.save(user);
		await this.illustrationRepository.save(illustration);
		await this.favoriteRepository.save(needAddFavorites);
		await this.favoriteRepository.save(needRemoveFavorites);

		return;
	}

	// 分页获取推荐用户列表
	async getRecommendUserInPages(current: number, pageSize: number, userId: string) {
		const countCacheKey = 'users:count';
		const userCacheKey = `user:${userId}:recommended-users-indexes`;

		if (Number(current) === 1) {
			await this.cacheManager.del(userCacheKey);
		}

		let recommendedIndexes: number[] = await this.cacheManager.get(userCacheKey);
		if (!recommendedIndexes) {
			recommendedIndexes = [];
		}

		const results = [];

		let totalCount: number = await this.cacheManager.get(countCacheKey);
		if (!totalCount) {
			totalCount = await this.userRepository.createQueryBuilder('user').getCount();
			await this.cacheManager.set(countCacheKey, totalCount, 1000 * 60 * 10);
		}

		const totalCountList = Array.from({ length: totalCount }, (_, index) => index);

		while (results.length < pageSize) {
			if (recommendedIndexes.length === totalCount - 1) {
				return results;
			}

			const diff = totalCountList.filter((index) => !recommendedIndexes.includes(index));

			const randomOffset = diff[Math.floor(Math.random() * diff.length)];

			const randomItem = await this.userRepository
				.createQueryBuilder('user')
				.skip(randomOffset)
				.take(1)
				.getOne();

			const latestIllustrations = await this.illustrationRepository.find({
				where: { user: { id: randomItem.id } },
				relations: ['user'],
				order: { createdTime: 'DESC' },
				take: 4,
			});

			randomItem.illustrations = latestIllustrations;

			if (randomItem.id === userId) {
				continue;
			}

			if (!randomItem || recommendedIndexes.includes(randomOffset)) {
				continue;
			}

			results.push(randomItem);
			recommendedIndexes.push(randomOffset);

			await this.cacheManager.set(userCacheKey, recommendedIndexes, 1000 * 60 * 30);
		}

		return results;
	}
}

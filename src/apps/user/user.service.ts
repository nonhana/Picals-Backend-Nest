import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { md5 } from 'src/utils';
import { hanaError } from 'src/error/hanaError';
import type { UpdateUserDto, LoginUserDto } from './dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { History } from '../history/entities/history.entity';
import { LabelService } from '../label/label.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class UserService {
	@Inject(CACHE_MANAGER)
	private readonly cacheManager: Cache;

	@Inject(PaginationService)
	private readonly paginationService: PaginationService;

	@Inject(LabelService)
	private readonly labelService: LabelService;

	@InjectRepository(User)
	private readonly userRepository: Repository<User>;

	@InjectRepository(History)
	private readonly historyRepository: Repository<History>;

	// 根据 email 查找单个用户
	async findUserByEmail(email: string) {
		return await this.userRepository.findOne({ where: { email } });
	}

	// 根据 id 查找单个用户
	async findUserById(id: string, relations?: string[]) {
		return await this.userRepository.findOne({ where: { id }, relations: relations || [] });
	}

	async login(loginUserDto: LoginUserDto) {
		const user = await this.findUserByEmail(loginUserDto.email);
		if (!user) throw new hanaError(10101);
		if (user.password !== md5(loginUserDto.password)) throw new hanaError(10102);
		return user;
	}

	async register(email: string, password: string) {
		if (await this.findUserByEmail(email)) throw new hanaError(10105);
		const user = new User();
		user.email = email;
		user.password = md5(password);
		await this.userRepository.save(user);
		return;
	}

	async getInfo(id: string) {
		const user = await this.findUserById(id);
		if (!user) throw new hanaError(10101);
		return user;
	}

	async updateInfo(id: string, updateUserDto: UpdateUserDto) {
		if (await this.findUserById(id)) throw new hanaError(10101);
		await this.userRepository.save({ id, ...updateUserDto });
		return;
	}

	async updatePassword(id: string, password: string) {
		if (await this.findUserById(id)) throw new hanaError(10101);
		await this.userRepository.save({
			id,
			password: md5(password),
		});
		return;
	}

	async getFavorites(id: string) {
		const user = await this.findUserById(id, ['favorites']);
		if (!user) throw new hanaError(10101);
		return user.favorites;
	}

	async getHistoryInPages(id: string, current: number, pageSize: number) {
		const user = await this.findUserById(id);
		if (!user) throw new hanaError(10101);
		return await this.paginationService.paginate(this.historyRepository, current, pageSize, {
			where: { user },
			order: { lastTime: 'DESC' },
		});
	}

	async getLikeLabels(id: string) {
		const user = await this.findUserById(id, ['likedLabels']);
		if (!user) throw new hanaError(10101);
		return user.likedLabels;
	}

	async likeLabelActions(userId: string, labelId: string, type: number) {
		const user = await this.findUserById(userId, ['likedLabels']);
		if (!user) throw new hanaError(10101);
		const isExist = user.likedLabels.some((label) => label.id === labelId);

		switch (type) {
			case 0: // 添加喜欢标签
				if (isExist) throw new hanaError(10401);
				const label = await this.labelService.findItemById(labelId);
				if (!label) throw new hanaError(10403);
				user.likedLabels.push(label);
				break;
			case 1: // 移除喜欢标签
				if (!isExist) throw new hanaError(10402);
				user.likedLabels = user.likedLabels.filter((label) => label.id !== labelId);
				break;
			default:
				throw new hanaError(10109);
		}
		await this.userRepository.save(user);
	}

	async isFollowed(userId: string, targetId: string) {
		const cacheKey = `user_following_${userId}`;
		let following = (await this.cacheManager.get(cacheKey)) as User[] | null;

		if (!following) {
			const user = await this.findUserById(userId, ['following']);
			if (!user) throw new hanaError(10101);
			following = user.following;
			await this.cacheManager.set(cacheKey, following, 1000 * 60 * 10); // 缓存10min
		}

		return following.some((item) => item.id === targetId);
	}

	async followAction(userId: string, targetId: string, type: number) {
		const user = await this.findUserById(userId, ['following']);
		if (!user) throw new hanaError(10101);
		const isFollowed = await this.isFollowed(userId, targetId);
		switch (type) {
			case 0: // 关注
				if (userId === targetId) throw new hanaError(10112);
				if (isFollowed) throw new hanaError(10110);
				const target = await this.findUserById(targetId);
				if (!target) throw new hanaError(10101);
				user.following.push(target);
				break;
			case 1: // 取消关注
				if (!isFollowed) throw new hanaError(10111);
				user.following = user.following.filter((item) => item.id !== targetId);
				break;
			default:
				throw new hanaError(10109);
		}
		await this.userRepository.save(user);
	}

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
}

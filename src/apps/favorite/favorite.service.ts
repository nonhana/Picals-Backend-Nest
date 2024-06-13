import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { In, Like, Repository } from 'typeorm';
import { CollectRecord } from './entities/collect-record.entity';
import { User } from '../user/entities/user.entity';
import { Illustration } from '../illustration/entities/illustration.entity';
import type { CreateFavoriteDto } from './dto/create-favorite.dto';
import type { EditFavoriteDto } from './dto/edit-favorite.dto';
import type { ChangeOrderDto } from './dto/change-order.dto';
import { hanaError } from 'src/error/hanaError';

@Injectable()
export class FavoriteService {
	@InjectRepository(User)
	private readonly userRepository: Repository<User>;

	@InjectRepository(Favorite)
	private readonly favoriteRepository: Repository<Favorite>;

	@InjectRepository(CollectRecord)
	private readonly collectRecordRepository: Repository<CollectRecord>;

	@InjectRepository(Illustration)
	private readonly illustrationRepository: Repository<Illustration>;

	// 获取用户的收藏夹列表
	async getFavoriteList(id: string) {
		return await this.favoriteRepository.find({ where: { user: { id } } });
	}

	// 创建用户的收藏夹
	async createFavorite(userId: string, createFavoriteDto: CreateFavoriteDto) {
		const favorite = new Favorite();
		favorite.user = { id: userId } as User;
		favorite.name = createFavoriteDto.name;
		favorite.introduce = createFavoriteDto.intro;
		if (createFavoriteDto.cover) favorite.cover = createFavoriteDto.cover;
		favorite.order = await this.favoriteRepository.count({ where: { user: { id: userId } } });
		return await this.favoriteRepository.save(favorite);
	}

	// 获取用户的插画收藏记录（作品id列表）
	async getFavoriteRecords(id: string) {
		const records = await this.collectRecordRepository.find({
			select: {
				illustration: {
					id: true,
				},
			},
			where: {
				user: { id },
			},
			relations: ['illustration'],
		});
		return records.map((record) => record.illustration.id);
	}

	// 添加用户的插画收藏记录
	async addFavoriteRecord(userId: string, illustrationId: string) {
		const record = new CollectRecord();
		record.user = { id: userId } as User;
		record.illustration = { id: illustrationId } as Illustration;
		return await this.collectRecordRepository.save(record);
	}

	// 移除用户的插画收藏记录
	async removeFavoriteRecord(userId: string, illustrationId: string) {
		return await this.collectRecordRepository.delete({
			user: { id: userId },
			illustration: { id: illustrationId },
		});
	}

	// 编辑收藏夹信息
	async editFavorite(userId: string, favoriteId: string, editFavoriteDto: EditFavoriteDto) {
		const favorite = await this.favoriteRepository.findOne({
			where: { id: favoriteId, user: { id: userId } },
		});
		if (editFavoriteDto.name) favorite.name = editFavoriteDto.name;
		if (editFavoriteDto.intro) favorite.introduce = editFavoriteDto.intro;
		if (editFavoriteDto.cover) favorite.cover = editFavoriteDto.cover;
		return await this.favoriteRepository.save(favorite);
	}

	// 删除某个收藏夹
	async deleteFavorite(userId: string, favoriteId: string) {
		const user = await this.userRepository.findOneBy({ id: userId });
		if (!user) throw new hanaError(10101);

		const favorite = await this.favoriteRepository.findOne({
			where: { id: favoriteId },
			relations: ['illustrations'],
		});
		if (!favorite) throw new hanaError(10601);

		// 删除收藏夹内的所有收藏记录
		favorite.illustrations.forEach(async (work) => {
			await this.collectRecordRepository.delete({
				user: { id: userId },
				illustration: { id: work.id },
			});
			work.collectCount--;
			await this.illustrationRepository.save(work);
		});

		user.collectCount -= favorite.workCount;

		// 删除收藏夹
		await this.favoriteRepository.remove(favorite);
		return;
	}

	// 更改收藏夹的排序
	async changeOrder(changeOrderDto: ChangeOrderDto) {
		const promises = changeOrderDto.orderList.map((item) =>
			this.favoriteRepository.update({ id: item.id }, { order: item.order }),
		);
		await Promise.all(promises);
		return true;
	}

	// 获取某收藏夹详细信息
	async getFavoriteDetail(favoriteId: string) {
		return await this.favoriteRepository.findOne({
			where: { id: favoriteId },
			relations: ['user'],
		});
	}

	// 分页获取某个收藏夹的插画列表
	async getFavoriteWorksInPages(favoriteId: string, current: number, pageSize: number) {
		return this.illustrationRepository.find({
			where: { favorites: { id: favoriteId } },
			relations: ['user'],
			take: pageSize,
			skip: (current - 1) * pageSize,
		});
	}

	// 搜索收藏夹内的作品
	async searchWorksInFavorite(
		favoriteId: string,
		keyword: string,
		current: number,
		pageSize: number,
	) {
		return await this.illustrationRepository.find({
			where: {
				favorites: { id: favoriteId },
				name: Like(`%${keyword}%`),
			},
			relations: ['user'],
			take: pageSize,
			skip: (current - 1) * pageSize,
		});
	}

	// 获取搜索结果数量
	async searchWorksCountInFavorite(favoriteId: string, keyword: string) {
		return await this.illustrationRepository.count({
			where: {
				favorites: { id: favoriteId },
				name: Like(`%${keyword}%`),
			},
		});
	}

	// 移动作品到其他收藏夹
	async moveCollect(userId: string, fromId: string, toId: string, workIds: string[]) {
		const user = await this.userRepository.findOneBy({ id: userId });
		if (!user) throw new hanaError(10101);

		const fromFavorite = await this.favoriteRepository.findOne({
			where: { id: fromId, user: { id: userId } },
			relations: ['illustrations'],
		});
		const toFavorite = await this.favoriteRepository.findOne({
			where: { id: toId, user: { id: userId } },
			relations: ['illustrations'],
		});
		if (!fromFavorite || !toFavorite) throw new hanaError(10601);

		const works = await this.illustrationRepository.findBy({ id: In(workIds) });

		for (const work of works) {
			const fromExist = fromFavorite.illustrations.some((item) => item.id === work.id);
			const toExist = toFavorite.illustrations.some((item) => item.id === work.id);

			if (!fromExist) continue;
			// 1. 从原收藏夹中移除
			fromFavorite.illustrations = fromFavorite.illustrations.filter((item) => item.id !== work.id);
			fromFavorite.workCount--;
			user.collectCount--;
			work.collectCount--;
			await this.illustrationRepository.save(work);
			await this.removeFavoriteRecord(userId, work.id);

			if (toExist) continue; // 如果目标收藏夹已存在该作品，则跳过

			// 2. 添加到目标收藏夹
			toFavorite.illustrations.push(work);
			toFavorite.workCount++;
			user.collectCount++;
			work.collectCount++;
			await this.illustrationRepository.save(work);
			await this.addFavoriteRecord(userId, work.id);
		}

		await this.favoriteRepository.save(fromFavorite);
		await this.favoriteRepository.save(toFavorite);
		await this.userRepository.save(user);
		return;
	}

	// 复制作品到其他收藏夹
	async copyCollect(userId: string, toId: string, workIds: string[]) {
		const user = await this.userRepository.findOneBy({ id: userId });
		if (!user) throw new hanaError(10101);

		const toFavorite = await this.favoriteRepository.findOne({
			where: { id: toId, user: { id: userId } },
			relations: ['illustrations'],
		});

		if (!toFavorite) throw new hanaError(10601);

		const works = await this.illustrationRepository.findBy({ id: In(workIds) });

		for (const work of works) {
			const toExist = toFavorite.illustrations.some((item) => item.id === work.id);
			if (toExist) continue; // 如果目标收藏夹已存在该作品，则跳过
			toFavorite.illustrations.push(work);
			toFavorite.workCount++;
			user.collectCount++;
			work.collectCount++;
			await this.illustrationRepository.save(work);
			await this.addFavoriteRecord(userId, work.id);
		}

		await this.favoriteRepository.save(toFavorite);
		await this.userRepository.save(user);
		return;
	}
}

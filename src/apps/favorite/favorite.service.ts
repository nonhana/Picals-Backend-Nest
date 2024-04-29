import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Like, Repository } from 'typeorm';
import { CollectRecord } from './entities/collect-record.entity';
import type { User } from '../user/entities/user.entity';
import { Illustration } from '../illustration/entities/illustration.entity';
import type { CreateFavoriteDto } from './dto/create-favotite.dto';
import type { EditFavoriteDto } from './dto/edit-favotite.dto';
import type { ChangeOrderDto } from './dto/change-order.dto';

@Injectable()
export class FavoriteService {
	@InjectRepository(Favorite)
	private favoriteRepository: Repository<Favorite>;

	@InjectRepository(CollectRecord)
	private collectRecordRepository: Repository<CollectRecord>;

	@InjectRepository(Illustration)
	private illustrationRepository: Repository<Illustration>;

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
		return await this.favoriteRepository.delete({ id: favoriteId, user: { id: userId } });
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

	// 移动作品到其他收藏夹
	async moveWorks(fromId: string, toId: string, workIds: string[]) {
		const fromFavorite = await this.favoriteRepository.findOne({
			where: { id: fromId },
			relations: ['illustrations'],
		});
		const toFavorite = await this.favoriteRepository.findOne({
			where: { id: toId },
			relations: ['illustrations'],
		});
		const works = fromFavorite.illustrations.filter((work) => workIds.includes(work.id));
		toFavorite.illustrations.push(...works);
		fromFavorite.illustrations = fromFavorite.illustrations.filter(
			(work) => !workIds.includes(work.id),
		);
		await this.favoriteRepository.save(fromFavorite);
		await this.favoriteRepository.save(toFavorite);
		return true;
	}

	// 分页获取某个收藏夹的插画列表
	async getFavoriteWorksInPages(favoriteId: string, current: number, pageSize: number) {
		return this.illustrationRepository.find({
			where: { favorites: { id: favoriteId } },
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
		const [works, total] = await this.illustrationRepository.findAndCount({
			where: {
				favorites: { id: favoriteId },
				name: Like(`%${keyword}%`),
			},
			relations: ['user'],
			take: pageSize,
			skip: (current - 1) * pageSize,
		});
		return { works, total };
	}
}

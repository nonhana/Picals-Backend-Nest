import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Repository } from 'typeorm';
import { CollectRecord } from './entities/collect-record.entity';
import type { User } from '../user/entities/user.entity';
import type { Illustration } from '../illustration/entities/illustration.entity';
import type { CreateFavoriteDto } from './dto/create-favotite.dto';

@Injectable()
export class FavoriteService {
	@InjectRepository(Favorite)
	private favoriteRepository: Repository<Favorite>;

	@InjectRepository(CollectRecord)
	private collectRecordRepository: Repository<CollectRecord>;

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
}

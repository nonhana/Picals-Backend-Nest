import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HistoryService {
	@InjectRepository(History)
	private historyRepository: Repository<History>;

	// 分页获取历史记录
	async getHistoryListInPages(userId: string, pageSize: number, current: number) {
		return await this.historyRepository.find({
			where: { user: { id: userId } },
			relations: ['illustration', 'illustration.user'],
			take: pageSize,
			skip: pageSize * (current - 1),
		});
	}

	// 新增用户浏览记录
	async addHistory(userId: string, workId: string) {
		const history = this.historyRepository.create({
			user: { id: userId },
			illustration: { id: workId },
		});
		return await this.historyRepository.save(history);
	}

	// 删除某条历史记录
	async deleteHistory(userId: string, historyId: string) {
		return await this.historyRepository.delete({ id: historyId, user: { id: userId } });
	}

	// 清空用户历史记录
	async clearHistory(userId: string) {
		return await this.historyRepository.delete({ user: { id: userId } });
	}

	// 根据作品名搜索历史记录
	async searchHistory(userId: string, keyword: string) {
		return await this.historyRepository
			.createQueryBuilder('history')
			.leftJoinAndSelect('history.illustration', 'illustration')
			.leftJoinAndSelect('illustration.user', 'user')
			.where('history.user.id = :userId', { userId })
			.andWhere('illustration.name LIKE :name', { name: `%${keyword}%` })
			.getMany();
	}
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HistoryService {
	@InjectRepository(History)
	private historyRepository: Repository<History>;

	// 分页获取指定日期的历史记录
	async getHistoryListInPages(userId: string, date: string, pageSize: number, current: number) {
		const startDate = new Date(date);
		const endDate = new Date(startDate);
		endDate.setDate(startDate.getDate() + 1);

		return await this.historyRepository
			.createQueryBuilder('history')
			.leftJoinAndSelect('history.user', 'user')
			.leftJoinAndSelect('history.illustration', 'illustration')
			.leftJoinAndSelect('illustration.user', 'author')
			.where('user.id = :userId', { userId })
			.andWhere('history.lastTime >= :startDate', { startDate })
			.andWhere('history.lastTime < :endDate', { endDate })
			.take(pageSize)
			.skip(pageSize * (current - 1))
			.orderBy('history.lastTime', 'DESC')
			.getMany();
	}

	// 获取指定日期的历史记录总数
	async getHistoryCount(userId: string, date: string) {
		const startDate = new Date(date);
		const endDate = new Date(startDate);
		endDate.setDate(startDate.getDate() + 1);

		return await this.historyRepository
			.createQueryBuilder('history')
			.where('history.user.id = :userId', { userId })
			.andWhere('history.lastTime >= :startDate', { startDate })
			.andWhere('history.lastTime < :endDate', { endDate })
			.getCount();
	}

	// 新增/更新用户浏览记录
	async addHistory(userId: string, workId: string) {
		const savedHistory = await this.historyRepository.findOneBy({
			user: { id: userId },
			illustration: { id: workId },
		});
		if (savedHistory) {
			return await this.historyRepository.save({
				...savedHistory,
				lastTime: new Date(),
			});
		}
		return await this.historyRepository.save({
			user: { id: userId },
			illustration: { id: workId },
		});
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
			.leftJoinAndSelect('history.user', 'user')
			.leftJoinAndSelect('history.illustration', 'illustration')
			.leftJoinAndSelect('illustration.user', 'author')
			.where('user.id = :userId', { userId })
			.andWhere('illustration.name LIKE :name', { name: `%${keyword}%` })
			.orderBy('history.lastTime', 'DESC')
			.getMany();
	}
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Label } from './entities/label.entity';
import { Repository } from 'typeorm';

// 生成随机的hex颜色
const randomColor = () => {
	return `#${Math.floor(Math.random() * 16777215)
		.toString(16)
		.padStart(6, '0')}`;
};

@Injectable()
export class LabelService {
	@InjectRepository(Label)
	private readonly labelRepository: Repository<Label>;

	async findItemById(id: string) {
		return await this.labelRepository.findOne({ where: { id } });
	}

	async findItemByValue(value: string) {
		return await this.labelRepository.findOne({ where: { value } });
	}

	async createItem(value: string) {
		const existedLabel = await this.findItemByValue(value);
		if (existedLabel) return existedLabel;
		const item = this.labelRepository.create({ value, color: randomColor() });
		return await this.labelRepository.save(item);
	}

	async createItems(values: string[]) {
		return await Promise.all(values.map(async (value) => await this.createItem(value)));
	}

	// 获取某个作品的标签列表
	async getItemsByIllustrationId(id: string) {
		return await this.labelRepository
			.createQueryBuilder('label')
			.leftJoin('label.illustrations', 'illustration')
			.where('illustration.id = :id', { id })
			.getMany();
	}
}

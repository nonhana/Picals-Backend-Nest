import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Label } from './entities/label.entity';
import { Repository } from 'typeorm';
import { Illustration } from '../illustration/entities/illustration.entity';

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

	@InjectRepository(Illustration)
	private readonly illustrationRepository: Repository<Illustration>;

	// 根据id查找标签
	async findItemById(id: string) {
		return await this.labelRepository.findOne({ where: { id } });
	}

	// 根据value查找标签
	async findItemByValue(value: string) {
		const label = await this.labelRepository.findOne({ where: { value } });
		if (!label) return null;
		return label;
	}

	// 创建标签
	async createItem(value: string) {
		const existedLabel = await this.findItemByValue(value);
		if (existedLabel) return existedLabel;
		const item = this.labelRepository.create({ value, color: randomColor() });
		return await this.labelRepository.save(item);
	}

	// 批量创建标签
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

	// 获取推荐标签列表
	async getRecommendLabels() {
		return await this.labelRepository.find({ take: 10 });
	}

	// 分页获取带有该标签的作品列表
	async getWorksByLabelInPages(labelId: string, pageSize: number, current: number) {
		const label = new Label();
		label.id = labelId;

		return await this.illustrationRepository
			.createQueryBuilder('illustration')
			.leftJoinAndSelect('illustration.labels', 'label')
			.where('label.id = :labelId', { labelId })
			.skip((current - 1) * pageSize)
			.take(pageSize)
			.getMany();
	}

	// 分页获取标签列表
	async getLabelsInPages(pageSize: number, current: number) {
		return await this.labelRepository.find({
			skip: (current - 1) * pageSize,
			take: pageSize,
		});
	}

	// 增加标签的作品数
	async increaseWorkCount(value: string) {
		const label = await this.findItemByValue(value);
		label.workCount += 1;
		return await this.labelRepository.save(label);
	}

	// 减少标签的作品数
	async decreaseWorkCount(value: string) {
		const label = await this.findItemByValue(value);
		label.workCount -= 1;
		return await this.labelRepository.save(label);
	}
}

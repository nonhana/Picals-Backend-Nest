import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Illustrator } from './entities/illustrator.entity';
import { Repository } from 'typeorm';
import type { NewIllustratorDto } from './dto/new-illustrator.dto';
import { hanaError } from 'src/error/hanaError';
import type { EditIllustratorDto } from './dto/edit-illustrator.dto';
import { Illustration } from '../illustration/entities/illustration.entity';
import { Like } from 'typeorm';

@Injectable()
export class IllustratorService {
	@InjectRepository(Illustrator)
	private readonly illustratorRepository: Repository<Illustrator>;

	@InjectRepository(Illustration)
	private readonly illustrationRepository: Repository<Illustration>;

	// 根据 id 查找插画家
	async findItemById(id: string) {
		return await this.illustratorRepository.findOne({ where: { id } });
	}

	// 根据名字查找插画家
	async findItemByName(name: string) {
		return await this.illustratorRepository.findOne({ where: { name } });
	}

	// 搜索插画家
	async searchIllustrators(keyword: string) {
		return await this.illustratorRepository.find({ where: { name: Like(`%${keyword}%`) } });
	}

	// 创建插画家
	async createItem(newIllustratorDto: NewIllustratorDto) {
		const existedIllustrator = await this.findItemByName(newIllustratorDto.name);
		if (existedIllustrator) throw new hanaError(10902);
		return await this.illustratorRepository.save(newIllustratorDto);
	}

	// 修改插画家信息
	async editItem(id: string, editIllustratorDto: EditIllustratorDto) {
		const illustrator = await this.findItemById(id);
		if (!illustrator) throw new hanaError(10901);
		return await this.illustratorRepository.save({ ...illustrator, ...editIllustratorDto });
	}

	// 分页获取插画家列表
	async getIllustratorList(current: number, size: number) {
		return await this.illustratorRepository.find({
			take: size,
			skip: (current - 1) * size,
		});
	}

	// 分页获取该插画家的作品列表
	async getIllustratorWorksInPages(id: string, current: number, size: number) {
		return await this.illustrationRepository.find({
			where: { illustrator: { id } },
			order: { createdTime: 'DESC' },
			take: size,
			skip: (current - 1) * size,
		});
	}
}

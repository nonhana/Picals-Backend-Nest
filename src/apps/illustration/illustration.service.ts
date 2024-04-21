import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Illustration } from './entities/illustration.entity';
import { Repository } from 'typeorm';
import { IllustratorService } from '../illustrator/illustrator.service';
import { LabelService } from '../label/label.service';
import { UserService } from '../user/user.service';
import type { UploadIllustrationDto } from './dto/upload-illustration.dto';
import { WorkPushTemp } from './entities/work-push-temp.entity';
import { hanaError } from 'src/error/hanaError';

@Injectable()
export class IllustrationService {
	@InjectRepository(Illustration)
	private readonly illustrationRepository: Repository<Illustration>;

	@InjectRepository(WorkPushTemp)
	private readonly workTempRepository: Repository<WorkPushTemp>;

	@Inject(IllustratorService)
	private readonly illustratorService: IllustratorService;

	@Inject(LabelService)
	private readonly labelService: LabelService;

	@Inject(UserService)
	private readonly userService: UserService;

	// 发布作品
	async createItem(id: string, uploadIllustrationDto: UploadIllustrationDto) {
		const { labels, illustratorInfo, ...basicInfo } = uploadIllustrationDto;

		const userEntity = await this.userService.getInfo(id);
		const labelsEntity = await this.labelService.createItems(labels);
		const illustratorEntity = await this.illustratorService.createItem(illustratorInfo);

		const illustration = this.illustrationRepository.create({
			...basicInfo,
			user: userEntity,
			labels: labelsEntity,
			illustrator: illustratorEntity,
		});

		const newWork = await this.illustrationRepository.save(illustration);

		// 将新作品推送给粉丝
		const fans = await this.userService.getFollowers(id);
		fans.forEach(async (fan) => {
			await this.workTempRepository.save({
				user: fan,
				illustration: newWork,
			});
		});

		return newWork;
	}

	// 分页获取推荐作品列表
	async getItemsInPages(pageSize: number, current: number) {
		return await this.illustrationRepository.find({
			take: pageSize,
			skip: pageSize * (current - 1),
		});
	}

	// 获取已关注用户新作
	async getFollowingWorks(id: string, pageSize: number, current: number) {
		return await this.workTempRepository.find({
			where: { user: { id } },
			relations: ['illustration', 'illustration.user', 'user'],
			take: pageSize,
			skip: pageSize * (current - 1),
			order: { createdAt: 'DESC' }, // 按照发布时间倒序，拿到最新的作品
		});
	}

	// 编辑已发布的作品
	async editItem(userId: string, workId: string, uploadIllustrationDto: UploadIllustrationDto) {
		const { labels, illustratorInfo, ...basicInfo } = uploadIllustrationDto;

		const userEntity = await this.userService.getInfo(userId);
		const labelsEntity = await this.labelService.createItems(labels);
		const illustratorEntity = await this.illustratorService.createItem(illustratorInfo);

		const illustration = await this.illustrationRepository.findOne({
			where: { id: workId },
			relations: ['user', 'labels', 'illustrator'],
		});

		if (illustration.user.id !== userId) {
			throw new hanaError(10502);
		}

		const newWork = this.illustrationRepository.create({
			...basicInfo,
			user: userEntity,
			labels: labelsEntity,
			illustrator: illustratorEntity,
		});

		await this.illustrationRepository.update(workId, newWork);

		return;
	}

	// 获取某个插画的详细信息
	async getDetail(id: string) {
		return await this.illustrationRepository.findOne({
			where: { id },
			relations: ['user', 'labels'],
		});
	}
}

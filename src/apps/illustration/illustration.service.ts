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
import { User } from '../user/entities/user.entity';
import { Illustrator } from '../illustrator/entities/illustrator.entity';

@Injectable()
export class IllustrationService {
	@InjectRepository(Illustration)
	private readonly illustrationRepository: Repository<Illustration>;

	@InjectRepository(User)
	private readonly userRepository: Repository<User>;

	@InjectRepository(Illustrator)
	private readonly illustratorRepository: Repository<Illustrator>;

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

		const user = await this.userRepository.findOneBy({ id });
		const illustrator = await this.illustratorRepository.findOneBy({ id: illustratorEntity.id });

		const illustration = this.illustrationRepository.create({
			...basicInfo,
			user: userEntity,
			labels: labelsEntity,
			illustrator: illustratorEntity,
		});

		if (basicInfo.isReprinted) {
			user.reprintedCount++;
		} else {
			user.originCount++;
		}
		await this.userRepository.save(user);

		illustrator.workCount++;
		await this.illustratorRepository.save(illustrator);

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
			relations: ['user'],
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

	// 获取已关注用户新作总数
	async getFollowingWorksCount(id: string) {
		return await this.workTempRepository.count({
			where: {
				user: { id },
			},
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
			relations: ['user', 'labels', 'favorites'],
		});
	}

	// 获取某个插画的简略信息
	async getSimple(id: string) {
		return await this.illustrationRepository.findOne({
			where: { id },
			relations: ['user'],
		});
	}

	// 根据标签分页搜索作品
	async getItemsByLabelInPages(labelName: string, pageSize: number, current: number) {
		const label = await this.labelService.findItemByValue(labelName);
		if (!label) throw new hanaError(10403);

		return await this.illustrationRepository
			.createQueryBuilder('illustration')
			.leftJoinAndSelect('illustration.labels', 'label')
			.leftJoinAndSelect('illustration.user', 'user')
			.where('label.id = :labelId', { labelId: label.id })
			.skip((current - 1) * pageSize)
			.take(pageSize)
			.getMany();
	}

	// 增加作品浏览量
	async addView(id: string) {
		await this.illustrationRepository.increment({ id }, 'viewCount', 1);
	}

	// 增减指定作品的评论数量
	async updateCommentCount(id: string, type: 'increase' | 'decrease', count: number = 1) {
		switch (type) {
			case 'increase':
				await this.illustrationRepository.increment({ id }, 'commentCount', count);
				break;
			case 'decrease':
				await this.illustrationRepository.decrement({ id }, 'commentCount', count);
				break;
		}
	}
}

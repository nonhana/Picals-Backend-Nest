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
import { Favorite } from '../favorite/entities/favorite.entity';

@Injectable()
export class IllustrationService {
	@Inject(IllustratorService)
	private readonly illustratorService: IllustratorService;

	@Inject(LabelService)
	private readonly labelService: LabelService;

	@Inject(UserService)
	private readonly userService: UserService;

	@InjectRepository(Illustration)
	private readonly illustrationRepository: Repository<Illustration>;

	@InjectRepository(User)
	private readonly userRepository: Repository<User>;

	@InjectRepository(Illustrator)
	private readonly illustratorRepository: Repository<Illustrator>;

	@InjectRepository(WorkPushTemp)
	private readonly workTempRepository: Repository<WorkPushTemp>;

	@InjectRepository(Favorite)
	private readonly favoriteRepository: Repository<Favorite>;

	// 分页随机获取推荐作品列表
	async getItemsInPages(pageSize: number, current: number) {
		return await this.illustrationRepository
			.createQueryBuilder('illustration')
			.leftJoinAndSelect('illustration.user', 'user')
			.take(pageSize)
			.skip(pageSize * (current - 1))
			.getMany();
	}

	// 获取已关注用户新作
	async getFollowingWorks(id: string, pageSize: number, current: number) {
		return await this.workTempRepository.find({
			where: { user: { id } },
			relations: ['illustration', 'illustration.user', 'user'],
			take: pageSize,
			skip: pageSize * (current - 1),
			order: {
				illustration: { createdTime: 'DESC' },
			}, // 按作品本身的创建时间倒序排列
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

	// 发布/编辑作品
	async submitForm(userId: string, uploadIllustrationDto: UploadIllustrationDto, workId?: string) {
		const { labels, illustratorInfo, ...basicInfo } = uploadIllustrationDto;

		const userEntity = await this.userService.getInfo(userId);
		const labelsEntity = await this.labelService.createItems(labels);

		const user = await this.userRepository.findOneBy({ id: userId });

		const entityInfo: { [key: string]: any } = {
			...basicInfo,
			user: userEntity,
			labels: labelsEntity,
		};

		let prevWork: Illustration;

		if (workId) {
			prevWork = await this.illustrationRepository.findOne({
				where: { id: workId },
				relations: ['illustrator', 'labels'],
			});
		}

		// 处理包含插画家的情况
		if (illustratorInfo) {
			const illustratorEntity = await this.illustratorService.createItem(illustratorInfo);
			if (workId) {
				if (!prevWork.illustrator) {
					illustratorEntity.workCount++;
				} else if (prevWork.illustrator.name !== illustratorEntity.name) {
					prevWork.illustrator.workCount--;
					await this.illustratorRepository.save(prevWork.illustrator);
					illustratorEntity.workCount++;
				}
			} else {
				illustratorEntity.workCount++;
			}
			await this.illustratorRepository.save(illustratorEntity);
			entityInfo.illustrator = illustratorEntity;
		}

		const illustration = this.illustrationRepository.create(entityInfo);

		if (basicInfo.isReprinted) {
			if (workId && prevWork.isReprinted === !basicInfo.isReprinted) user.originCount--;
			user.reprintedCount++;
		} else {
			if (workId && prevWork.isReprinted === !basicInfo.isReprinted) user.reprintedCount--;
			user.originCount++;
		}
		await this.userRepository.save(user);

		const newWork = await this.illustrationRepository.save(
			workId ? { id: workId, ...illustration } : illustration,
		);

		if (!workId) {
			// 将新作品推送给粉丝
			const fans = await this.userService.getFollowers(userId);
			fans.forEach(async (fan) => {
				await this.workTempRepository.save({
					user: fan,
					illustration: newWork,
				});
			});
		}

		if (workId) {
			// 和之前的标签进行比对，更新标签的作品数量
			const prevLabels = prevWork.labels;
			const newLabels = labelsEntity;
			const addLabels = newLabels.filter((label) => !prevLabels.includes(label));
			const delLabels = prevLabels.filter((label) => !newLabels.includes(label));

			addLabels.forEach((label) => {
				this.labelService.increaseWorkCount(label.value);
			});
			delLabels.forEach((label) => {
				this.labelService.decreaseWorkCount(label.value);
			});
		} else {
			// 更新标签的作品数量
			labels.forEach((label) => {
				this.labelService.increaseWorkCount(label);
			});
		}

		return newWork;
	}

	// 删除已发布的作品
	async deleteItem(userId: string, workId: string) {
		const illustration = await this.illustrationRepository.findOne({
			where: { id: workId },
			relations: ['user', 'illustrator', 'labels', 'favorites'],
		});

		const user = illustration.user;
		const illustrator = illustration.illustrator;
		const labels = illustration.labels;
		const favorites = illustration.favorites;

		if (illustration.isReprinted) {
			user.reprintedCount--;
		} else {
			user.originCount--;
		}
		user.likeCount--;
		user.collectCount--;
		await this.userRepository.save(user);

		if (illustrator) {
			illustrator.workCount--;
			await this.illustratorRepository.save(illustrator);
		}

		labels.forEach((label) => {
			this.labelService.decreaseWorkCount(label.value);
		});

		favorites.forEach(async (favorite) => {
			favorite.workCount--;
			await this.favoriteRepository.save(favorite);
		});

		if (illustration.user.id !== userId) throw new hanaError(10502);

		await this.illustrationRepository.remove(illustration);

		return;
	}

	// 获取某个插画的详细信息
	async getDetail(id: string) {
		const work = await this.illustrationRepository.findOne({
			where: { id },
			relations: ['user', 'labels', 'favorites', 'favorites.user', 'illustrator'],
		});
		if (!work) return null;
		return work;
	}

	// 获取某个插画的简略信息
	async getSimple(id: string) {
		return await this.illustrationRepository.findOne({
			where: { id },
			relations: ['user'],
		});
	}

	async getItemsByLabelInPages(
		labelName: string,
		sortType: string,
		pageSize: number,
		current: number,
	) {
		const label = await this.labelService.findItemByValue(labelName);
		if (!label) throw new hanaError(10403);

		// 根据 sortType 进行排序
		let orderByClause: { [key: string]: 'ASC' | 'DESC' };
		switch (sortType) {
			case 'new':
				orderByClause = { 'illustration.createdTime': 'DESC' }; // 按创建时间倒序排列
				break;
			case 'old':
				orderByClause = { 'illustration.createdTime': 'ASC' }; // 按创建时间正序排列
				break;
			case 'like':
				orderByClause = { 'illustration.likeCount': 'DESC' }; // 按喜欢数倒序排列
				break;
			case 'collect':
				orderByClause = { 'illustration.collectCount': 'DESC' }; // 按收藏数倒序排列
				break;
			default:
				throw new hanaError(10404); // 无效的排序类型
		}

		return await this.illustrationRepository
			.createQueryBuilder('illustration')
			.leftJoinAndSelect('illustration.labels', 'label')
			.leftJoinAndSelect('illustration.user', 'user')
			.where('label.id = :labelId', { labelId: label.id })
			.orderBy(orderByClause) // 动态排序
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

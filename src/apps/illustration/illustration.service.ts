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
import { downloadFile } from 'src/utils';
import { ImgHandlerService } from 'src/img-handler/img-handler.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import * as sharp from 'sharp';
import axios from 'axios';
import { Image } from './entities/image.entity';

@Injectable()
export class IllustrationService {
	@Inject(CACHE_MANAGER)
	private readonly cacheManager: Cache;

	@Inject(IllustratorService)
	private readonly illustratorService: IllustratorService;

	@Inject(LabelService)
	private readonly labelService: LabelService;

	@Inject(UserService)
	private readonly userService: UserService;

	@Inject(ImgHandlerService)
	private readonly imgHandlerService: ImgHandlerService;

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

	@InjectRepository(Image)
	private readonly imageRepository: Repository<Image>;

	// 分页随机获取推荐作品列表
	async getItemsInPages(pageSize: number, current: number, userId: string | undefined) {
		if (userId) {
			const countCacheKey = 'illustrations:count';
			const userCacheKey = `user:${userId}:recommended-illustrations-indexes`;

			if (Number(current) === 1) {
				await this.cacheManager.del(userCacheKey);
			}

			let recommendedIndexes: number[] = await this.cacheManager.get(userCacheKey);
			if (!recommendedIndexes) {
				recommendedIndexes = [];
			}

			const results = [];

			let totalCount: number = await this.cacheManager.get(countCacheKey);
			if (!totalCount) {
				totalCount = await this.illustrationRepository.count();
				await this.cacheManager.set(countCacheKey, totalCount, 1000 * 60 * 10);
			}

			const totalCountList = new Array(totalCount).fill(0).map((_, index) => index);

			while (results.length < pageSize) {
				if (recommendedIndexes.length === totalCount) {
					return results;
				}

				const diff = totalCountList.filter((index) => !recommendedIndexes.includes(index));

				const randomOffset = diff[Math.floor(Math.random() * diff.length)];

				const randomItem = await this.illustrationRepository
					.createQueryBuilder('illustration')
					.leftJoinAndSelect('illustration.user', 'user')
					.skip(randomOffset)
					.take(1)
					.getOne();

				if (!randomItem || recommendedIndexes.includes(randomOffset)) {
					continue;
				}

				results.push(randomItem);
				recommendedIndexes.push(randomOffset);

				await this.cacheManager.set(userCacheKey, recommendedIndexes, 1000 * 60 * 30);
			}

			return results;
		} else {
			return await this.illustrationRepository
				.createQueryBuilder('illustration')
				.leftJoinAndSelect('illustration.user', 'user')
				.orderBy('illustration.createdTime', 'DESC')
				.skip(pageSize * (current - 1))
				.take(pageSize)
				.getMany();
		}
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

	// 获取已关注用户新作id列表
	async getFollowingWorksId(id: string) {
		const records = await this.workTempRepository.find({
			where: { user: { id } },
			relations: ['illustration'],
			order: {
				illustration: { createdTime: 'DESC' },
			},
		});
		return records.map((record) => record.illustration.id);
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

		// 处理封面
		if ((prevWork && prevWork.imgList[0] !== basicInfo.imgList[0]) || !prevWork) {
			const coverSourceUrl = basicInfo.imgList[0];
			const fileName = coverSourceUrl.split('/').pop().split('.')[0];
			const imgBuffer = await downloadFile(coverSourceUrl);
			const coverUrl = await this.imgHandlerService.generateThumbnail(imgBuffer, fileName);
			entityInfo.cover = coverUrl;
		}

		// 处理包含插画家的情况
		if (illustratorInfo) {
			const illustratorEntity = await this.illustratorService.findItemByName(illustratorInfo.name);
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

		if (basicInfo.reprintType !== 0) {
			if (workId) {
				if (prevWork.reprintType === 0) {
					user.originCount--;
					user.reprintedCount++;
				}
			} else {
				user.reprintedCount++;
			}
		} else {
			if (workId) {
				if (prevWork.reprintType !== 0) {
					user.reprintedCount--;
					user.originCount++;
				}
			} else {
				user.originCount++;
			}
		}
		await this.userRepository.save(user);

		const newWork = await this.illustrationRepository.save(
			workId ? { id: workId, ...illustration } : illustration,
		);

		// 处理图片列表
		if (workId) {
			// 如果是编辑作品，先找出新增的图片和移除的图片
			const prevImgList = prevWork.imgList;
			const newImgList = basicInfo.imgList.filter((img) => !prevImgList.includes(img));
			const delImgList = prevImgList.filter((img) => !basicInfo.imgList.includes(img));

			// 将新的图片存入Image表中
			for (const imgUrl of newImgList) {
				await this.singleUrlToImage(imgUrl, workId);
			}

			// 删除不再使用的图片
			for (const imgUrl of delImgList) {
				const image = await this.imageRepository.findOneBy({ originUrl: imgUrl });
				await this.imageRepository.remove(image);
			}
		} else {
			// 遍历imgList中的每个url，将其存入Image表中
			for (const imgUrl of basicInfo.imgList) {
				await this.singleUrlToImage(imgUrl, newWork.id);
			}
		}

		if (!workId) {
			// 将新作品推送给粉丝
			const records = await this.userService.getFollowers(userId);
			records.forEach(async (record) => {
				await this.workTempRepository.save({
					author: user,
					user: record.follower,
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

			addLabels.forEach(async (label) => {
				await this.labelService.increaseWorkCount(label.value);
			});
			delLabels.forEach(async (label) => {
				await this.labelService.decreaseWorkCount(label.value);
			});
		} else {
			// 更新标签的作品数量
			labels.forEach(async (label) => {
				await this.labelService.increaseWorkCount(label);
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
		if (illustration.user.id !== userId) throw new hanaError(10502);

		const user = illustration.user;
		const illustrator = illustration.illustrator;
		const labels = illustration.labels;
		const favorites = illustration.favorites;

		if (illustration.reprintType !== 0) {
			user.reprintedCount--;
		} else {
			user.originCount--;
		}
		await this.userRepository.save(user);

		if (illustrator) {
			illustrator.workCount--;
			await this.illustratorRepository.save(illustrator);
		}

		labels.forEach(async (label) => {
			await this.labelService.decreaseWorkCount(label.value);
		});

		favorites.forEach(async (favorite) => {
			favorite.workCount--;
			await this.favoriteRepository.save(favorite);
		});

		await this.illustrationRepository.remove(illustration);
		return;
	}

	// 获取某个插画的详细信息
	async getDetail(id: string) {
		const work = await this.illustrationRepository.findOne({
			where: { id },
			relations: ['user', 'images', 'labels', 'favorites', 'favorites.user', 'illustrator'],
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

	// 根据标签搜索作品
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

	// 根据标签搜索作品，返回作品id列表
	async getItemsIdByLabel(labelName: string, sortType: string) {
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

		const illustrations = await this.illustrationRepository
			.createQueryBuilder('illustration')
			.leftJoinAndSelect('illustration.labels', 'label')
			.where('label.id = :labelId', { labelId: label.id })
			.orderBy(orderByClause) // 动态排序
			.getMany();

		return illustrations.map((illustration) => illustration.id);
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

	// 获取背景图
	async getBackground(idList: number[]) {
		const chosenIdList = idList;

		const countCacheKey = 'images:count';

		const result: string[] = [];

		// 从全部的图片列表中随机选取一张
		let totalCount: number = await this.cacheManager.get(countCacheKey);
		if (!totalCount) {
			totalCount = await this.imageRepository.count();
			await this.cacheManager.set(countCacheKey, totalCount, 1000 * 60 * 10);
		}

		while (result.length === 0) {
			const randomOffset = Math.floor(Math.random() * totalCount);
			if (chosenIdList.includes(randomOffset)) {
				continue;
			}
			const randomItem = await this.imageRepository
				.createQueryBuilder('image')
				.skip(randomOffset)
				.take(1)
				.getOne();

			if (randomItem) {
				if (
					randomItem.originWidth / randomItem.originHeight > 1.5 &&
					randomItem.originWidth > 1440
				) {
					result.push(randomItem.originUrl);
					if (!chosenIdList.includes(randomOffset)) {
						chosenIdList.push(randomOffset);
					}
				}
			}
		}

		return { result, chosenIdList };
	}

	// 遍历目前数据库中所有的插画列表，将其中的图片信息读取后存入Image表中
	async urlToImage() {
		const illustrations = await this.illustrationRepository.find();

		for (const illustration of illustrations) {
			const { imgList } = illustration;
			for (const imgUrl of imgList) {
				const imageRecord = await this.imageRepository.findOneBy({ originUrl: imgUrl });
				if (imageRecord) continue; // 如果已经存在则跳过

				const newImage = this.imageRepository.create({
					originUrl: imgUrl,
				});

				// 通过 axios + sharp 获取图片的宽高信息
				const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
				const image = sharp(response.data);
				const metadata = await image.metadata();

				newImage.originWidth = metadata.width;
				newImage.originHeight = metadata.height;

				// 将图片压缩为缩略图
				const fileName = imgUrl.split('/').pop().split('.')[0];
				const result = (await this.imgHandlerService.generateThumbnail(
					response.data,
					fileName,
					'detail',
				)) as {
					url: string;
					width: number;
					height: number;
				};
				newImage.thumbnailUrl = result.url;
				newImage.thumbnailWidth = result.width;
				newImage.thumbnailHeight = result.height;

				newImage.illustration = illustration;

				await this.imageRepository.save(newImage);
			}
		}
	}

	// 根据插画的原图地址，将图片信息读取后存入Image表中
	async singleUrlToImage(url: string, illustrationId: string) {
		const imageRecord = await this.imageRepository.findOneBy({ originUrl: url });
		if (imageRecord) return; // 如果已经存在则跳过

		const newImage = this.imageRepository.create({
			originUrl: url,
		});

		// 通过 axios + sharp 获取图片的宽高信息
		const response = await axios.get(url, { responseType: 'arraybuffer' });
		const image = sharp(response.data);
		const metadata = await image.metadata();

		newImage.originWidth = metadata.width;
		newImage.originHeight = metadata.height;

		// 将图片压缩为缩略图
		const fileName = url.split('/').pop().split('.')[0];
		console.log('fileName', fileName);
		const result = (await this.imgHandlerService.generateThumbnail(
			response.data,
			fileName,
			'detail',
		)) as {
			url: string;
			width: number;
			height: number;
		};
		newImage.thumbnailUrl = result.url;
		newImage.thumbnailWidth = result.width;
		newImage.thumbnailHeight = result.height;

		newImage.illustration = await this.illustrationRepository.findOneBy({ id: illustrationId });

		return await this.imageRepository.save(newImage);
	}
}

import { Inject, Injectable } from '@nestjs/common';
import type { UploadIllustrationDto } from '@/apps/illustration/dto/upload-illustration.dto';
import { UserService } from '@/apps/user/user.service';
import { LabelService } from '@/apps/label/label.service';
import { IllustratorService } from '@/apps/illustrator/illustrator.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Illustrator } from '@/apps/illustrator/entities/illustrator.entity';
import { Repository } from 'typeorm';
import { Illustration } from '@/apps/illustration/entities/illustration.entity';
import { User } from '@/apps/user/entities/user.entity';
import { Image } from '@/apps/illustration/entities/image.entity';

@Injectable()
export class InitsService {
	private readonly email: string;

	constructor() {
		this.email = 'zhouxiang757@gmail.com';
	}

	@Inject(UserService)
	private readonly userService: UserService;

	@Inject(LabelService)
	private readonly labelService: LabelService;

	@Inject(IllustratorService)
	private readonly illustratorService: IllustratorService;

	@InjectRepository(Illustrator)
	private readonly illustratorRepository: Repository<Illustrator>;

	@InjectRepository(Illustration)
	private readonly illustrationRepository: Repository<Illustration>;

	@InjectRepository(User)
	private readonly userRepository: Repository<User>;

	@InjectRepository(Image)
	private readonly imageRepository: Repository<Image>;

	generateMockData() {
		const data: UploadIllustrationDto[] = Array.from({ length: 243 }).map((_, index) => ({
			name: `作品${index + 1}`,
			intro: `这是作品${index + 1}的简介`,
			labels: [`标签${index}`, `标签${index + 1}`, `标签${index + 2}`],
			reprintType: 1,
			openComment: true,
			isAIGenerated: false,
			imgList: ['https://moe.nonhana.pics/121681460_0.jpg'],
			workUrl: 'https://www.pixiv.net/artworks/121681460',
			illustratorInfo: {
				name: 'ZUU',
				homeUrl: 'https://www.pixiv.net/users/2247698',
			},
		}));

		return data;
	}

	async mock() {
		console.log('用户 email:', this.email);

		const targetUser = await this.userService.findUserByEmail(this.email);

		console.log('目标用户:', targetUser);

		const data = this.generateMockData();

		let count = 0;
		for (const item of data) {
			console.log('正在处理第', count + 1, '条数据');

			const { labels, illustratorInfo, ...rest } = item;

			const labelsEntity = await this.labelService.createItems(labels);

			const entityInfo: Record<string, any> = {
				...rest,
				user: targetUser,
				labels: labelsEntity,
				cover: item.imgList[0],
			};

			const illustratorEntity = await this.illustratorService.findItemByName(illustratorInfo.name);

			if (illustratorEntity) {
				illustratorEntity.workCount++;
				await this.illustratorRepository.save(illustratorEntity);
				entityInfo.illustrator = illustratorEntity;
			} else {
				const newIllustrator = await this.illustratorService.createItem(illustratorInfo);
				newIllustrator.workCount++;
				await this.illustratorRepository.save(newIllustrator);
				entityInfo.illustrator = newIllustrator;
			}

			const illustration = this.illustrationRepository.create(entityInfo);

			targetUser.reprintedCount++;
			await this.userRepository.save(targetUser);

			const newWork = await this.illustrationRepository.save(illustration);

			for (const imgUrl of rest.imgList) {
				const newImage = this.imageRepository.create({ originUrl: imgUrl });
				newImage.originSize = 2;
				newImage.originWidth = 0;
				newImage.originHeight = 0;
				newImage.thumbnailUrl = imgUrl;
				newImage.thumbnailSize = 2;
				newImage.thumbnailWidth = 0;
				newImage.thumbnailHeight = 0;
				newImage.illustration = newWork;
				await this.imageRepository.save(newImage);
			}

			for (const label of labels) {
				await this.labelService.increaseWorkCount(label);
			}

			count++;
		}
	}
}

import { Inject, Injectable } from '@nestjs/common';
import type { UploadIllustrationDto } from '@/modules/illustration/dto/upload-illustration.dto';
import { UserService } from '@/modules/user/user.service';
import { LabelService } from '@/modules/label/label.service';
import { IllustratorService } from '@/modules/illustrator/illustrator.service';
import { IllustrationService } from '@/modules/illustration/illustration.service';
import { R2Service } from '@/r2/r2.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Illustrator } from '@/modules/illustrator/entities/illustrator.entity';
import { Repository } from 'typeorm';
import { Illustration } from '@/modules/illustration/entities/illustration.entity';
import { User } from '@/modules/user/entities/user.entity';
import { Image } from '@/modules/illustration/entities/image.entity';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
import { suffixGenerator } from 'src/utils';
import { hanaError } from '@/error/hanaError';
import axios from 'axios';

@Injectable()
export class ScriptsService {
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

	@Inject(IllustrationService)
	private readonly illustrationService: IllustrationService;

	@Inject(R2Service)
	private readonly r2Service: R2Service;

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
		const existedCount = await this.illustrationRepository.count();

		if (existedCount > 0) {
			console.log('已经存在数据，无需初始化');
			return;
		}

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

	// 根据指定的文件路径，读取其中的图片信息并上传
	async uploadDir(dirPath: string, userEmail: string) {
		console.log('当前上传用户的 email', userEmail);

		const user = await this.userService.findUserByEmail(userEmail);
		if (!user) throw new hanaError(10101);
		const { id: userId } = user;

		console.log('当前上传用户的 id', userId);

		if (!fs.existsSync(dirPath)) throw new hanaError(10507);

		const illustratorId = dirPath.split('\\').pop();
		const illustratorHomeUrl = `https://www.pixiv.net/users/${illustratorId}`;
		let illustratorName = '';
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto(illustratorHomeUrl);
		await page.waitForSelector('.sc-1bcui9t-5');
		illustratorName = await page.$eval('.sc-1bcui9t-5', (el) => el.textContent);
		await browser.close();
		const illustratorEntity = await this.illustratorService.findItemByName(illustratorName);
		if (!illustratorEntity)
			await this.illustratorService.createItem({
				name: illustratorName,
				homeUrl: illustratorHomeUrl,
			});

		const pixivIdObj: { [key: string]: string[] } = {};
		const files = fs.readdirSync(dirPath);
		files.forEach((file) => {
			if (file.endsWith('.jpg') || file.endsWith('.png')) {
				const pixivId = file.split('_')[0];
				if (!pixivIdObj[pixivId]) {
					pixivIdObj[pixivId] = [];
				}
				pixivIdObj[pixivId].push(`${dirPath}\\${file}`);
			}
		});

		const tagsFilePath = `${dirPath}\\tags.json`;
		if (!fs.existsSync(tagsFilePath)) throw new hanaError(10508);
		const tagsFileContent = fs.readFileSync(tagsFilePath, 'utf-8');
		const tagsObj = JSON.parse(tagsFileContent);

		for (const pixivWorkId of Object.keys(pixivIdObj)) {
			const workUrl = `https://www.pixiv.net/artworks/${pixivWorkId}`;
			const uploadForm: UploadIllustrationDto = {
				labels: tagsObj[pixivWorkId],
				reprintType: 1,
				openComment: true,
				isAIGenerated: false,
				imgList: [],
				workUrl,
				illustratorInfo: {
					name: illustratorName,
					homeUrl: illustratorHomeUrl,
				},
			};
			for (const imgPath of pixivIdObj[pixivWorkId]) {
				const targetPath = 'images-' + suffixGenerator(imgPath.split('\\').pop());
				const result = await this.r2Service.uploadFileToR2(imgPath, targetPath);
				uploadForm.imgList.push(result);
			}
			await this.illustrationService.submitForm(userId, uploadForm);
			console.log(`作品 ${pixivWorkId} 上传成功`);
		}
		return;
	}

	// 更新数据库所有的图片大小信息
	async updateImageSize() {
		const imgList = await this.imageRepository.find();
		let imgCount = imgList.length;
		for (const img of imgList) {
			const { originUrl, thumbnailUrl, originSize, thumbnailSize } = img;
			if (originSize && thumbnailSize) {
				console.log(`已更新 ${originUrl} 的大小信息，剩余 ${--imgCount} 张图片`);
				continue;
			}
			const originResponse = await axios.get(originUrl, { responseType: 'arraybuffer' });
			img.originSize = originResponse.headers['content-length'] / 1024;
			const thumbnailResponse = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
			img.thumbnailSize = thumbnailResponse.headers['content-length'] / 1024;
			await this.imageRepository.save(img);
			console.log(`已更新 ${img.originUrl} 的大小信息，剩余 ${--imgCount} 张图片`);
		}
		return '更新成功';
	}
}

import { Inject, Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { R2Service } from '@/infra/r2/r2.service';

@Injectable()
export class ImgHandlerService {
	@Inject()
	private readonly r2Service: R2Service;

	// 压缩图片为缩略图
	async generateThumbnail(
		imageBuffer: Buffer,
		fileName: string,
		type: 'cover' | 'detail' | 'avatar' | 'background' = 'cover',
	) {
		const outputPath = path.join(__dirname, 'uploads', fileName + '-' + type + '-thumbnail.jpg');

		// 确保目录存在
		if (!fs.existsSync(path.dirname(outputPath))) {
			fs.mkdirSync(path.dirname(outputPath), { recursive: true });
		}

		// 获取图片的元数据
		const metadata = await sharp(imageBuffer).metadata();

		let leastLength: number;
		if (type === 'cover') {
			const maxSide = Math.max(metadata.width, metadata.height);
			leastLength = maxSide < 400 ? maxSide : 400;
		} else if (type === 'detail') {
			const maxSide = Math.max(metadata.width, metadata.height);
			leastLength = maxSide < 800 ? maxSide : 800;
		} else if (type === 'background') {
			const maxSide = Math.max(metadata.width, metadata.height);
			leastLength = maxSide < 1200 ? maxSide : 1200;
		} else {
			leastLength = 200;
		}

		const newWidth = metadata.width > metadata.height ? null : leastLength;
		const newHeight = metadata.height > metadata.width ? null : leastLength;

		// 使用sharp调整尺寸并压缩质量
		const file = await sharp(imageBuffer)
			.resize(newWidth, newHeight) // 按比例调整尺寸
			.jpeg({ quality: 80 })
			.toFile(outputPath);

		const targetPath = 'images' + outputPath.split('uploads')[1].replace(/\\/g, '/');

		const resultUrl = await this.r2Service.uploadFileToR2(outputPath, targetPath);
		if (type === 'cover' || type === 'avatar') {
			return resultUrl;
		} else {
			return {
				url: resultUrl,
				width: file.width,
				height: file.height,
				size: file.size,
			};
		}
	}
}

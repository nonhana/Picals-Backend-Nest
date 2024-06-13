import { Inject, Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { R2Service } from 'src/r2/r2.service';

@Injectable()
export class ImgHandlerService {
	@Inject()
	private readonly r2Service: R2Service;

	constructor() {}

	async generateThumbnail(imageBuffer: Buffer, fileName: string) {
		const outputPath = path.join(__dirname, 'uploads', fileName + '-thumbnail.jpg');

		// 确保目录存在
		if (!fs.existsSync(path.dirname(outputPath))) {
			fs.mkdirSync(path.dirname(outputPath), { recursive: true });
		}

		// 获取图片的元数据
		const metadata = await sharp(imageBuffer).metadata();

		// 计算新的尺寸，保持宽高比，最短边为200像素
		const newWidth = metadata.width > metadata.height ? null : 400;
		const newHeight = metadata.height > metadata.width ? null : 400;

		// 使用sharp调整尺寸并压缩质量
		await sharp(imageBuffer)
			.resize(newWidth, newHeight) // 按比例调整尺寸，最短边400像素
			.jpeg({ quality: 80 }) // 调整压缩质量，这里以JPEG格式为例，质量设为80
			.toFile(outputPath);

		const targetPath = 'images' + outputPath.split('uploads')[1].replace(/\\/g, '/');
		return await this.r2Service.uploadFileToR2(outputPath, targetPath);
	}
}

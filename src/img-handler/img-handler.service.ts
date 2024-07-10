import { Inject, Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
// import { TinyColor } from '@ctrl/tinycolor';
// import { createCanvas, registerFont, type CanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { R2Service } from 'src/r2/r2.service';

@Injectable()
export class ImgHandlerService {
	@Inject()
	private readonly r2Service: R2Service;

	constructor() {}

	// isWarmHue = (color: string): boolean => {
	// 	const colorObj = new TinyColor(color);
	// 	return colorObj.isLight();
	// };

	// randomColor = () => {
	// 	return `#${Math.floor(Math.random() * 16777215)
	// 		.toString(16)
	// 		.padStart(6, '0')}`;
	// };

	// wrapText = (context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
	// 	const words = text.split(' ');
	// 	let line = '';
	// 	const lines = [];

	// 	for (let n = 0; n < words.length; n++) {
	// 		const testLine = line + words[n] + ' ';
	// 		const metrics = context.measureText(testLine);
	// 		const testWidth = metrics.width;
	// 		if (testWidth > maxWidth && n > 0) {
	// 			lines.push(line);
	// 			line = words[n] + ' ';
	// 		} else {
	// 			line = testLine;
	// 		}
	// 	}
	// 	lines.push(line);
	// 	return lines;
	// };

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
			};
		}
	}

	// 生成默认图片
	// async getDefaultImage(text: string, color?: string): Promise<string> {
	// 	const fontPath = path.resolve(
	// 		__dirname,
	// 		'..',
	// 		'..',
	// 		'assets',
	// 		'fonts',
	// 		'NotoSansSC-Regular.ttf',
	// 	);
	// 	registerFont(fontPath, { family: 'Noto Sans SC', weight: 'regular' });

	// 	const imageSize = 600;
	// 	const bgColor = color || this.randomColor();
	// 	const textColor = this.isWarmHue(bgColor) ? '#3d3d3d' : '#fff';

	// 	const canvas = createCanvas(imageSize, imageSize);
	// 	const context = canvas.getContext('2d');
	// 	context.fillStyle = bgColor;
	// 	context.fillRect(0, 0, imageSize, imageSize);
	// 	context.font = '64px "Noto Sans SC"';
	// 	context.fillStyle = textColor;
	// 	context.textAlign = 'center';
	// 	context.textBaseline = 'middle';
	// 	context.fillText(text, imageSize / 2, imageSize / 2);

	// 	const buffer = canvas.toBuffer('image/jpeg');

	// 	// 将图片保存到R2并返回URL
	// 	const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + text;
	// 	const outputPath = path.join(__dirname, 'uploads', uniqueSuffix + '-default.jpg');
	// 	if (!fs.existsSync(path.dirname(outputPath))) {
	// 		fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	// 	}
	// 	await sharp(buffer).toFile(outputPath);
	// 	const targetPath = 'images' + outputPath.split('uploads')[1].replace(/\\/g, '/');
	// 	return await this.r2Service.uploadFileToR2(outputPath, targetPath);
	// }
}

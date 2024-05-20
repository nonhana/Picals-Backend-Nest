import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { SingleImgInterceptor } from './interceptors/single-img-interceptor';
import { uploadFileToCos } from './utils';
import { hanaError } from './error/hanaError';

@Controller('tool')
export class AppController {
	@Post('upload-single-img')
	@UseInterceptors(SingleImgInterceptor)
	async uploadImg(@UploadedFile() file: Express.Multer.File) {
		if (!file) throw new hanaError(11004);
		const filePath = file.path;
		const targetPath = 'images' + filePath.split('uploads')[1].replace(/\\/g, '/');
		try {
			const result = await uploadFileToCos(filePath, targetPath);
			return result;
		} catch (error) {
			throw new hanaError(11001);
		}
	}
}

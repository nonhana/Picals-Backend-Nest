import { Controller, Inject, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { SingleImgInterceptor } from './interceptors/single-img-interceptor';
import { CosService } from './cos/cos.service';
import { hanaError } from './error/hanaError';

@Controller('tool')
export class AppController {
	@Inject()
	private readonly cosService: CosService;

	@Post('upload-single-img')
	@UseInterceptors(SingleImgInterceptor)
	async uploadImg(@UploadedFile() file: Express.Multer.File) {
		if (!file) throw new hanaError(11004);
		const filePath = file.path;
		const targetPath = 'images' + filePath.split('uploads')[1].replace(/\\/g, '/');
		console.log('targetPath:', targetPath);
		try {
			const result = await this.cosService.uploadFileToCos(filePath, targetPath);
			return result;
		} catch (error) {
			throw new hanaError(11001, error.message);
		}
	}

	@Post('delete-single-img')
	async deleteImg(targetPath: string) {
		try {
			await this.cosService.deleteFileFromCos(targetPath);
		} catch (error) {
			throw new hanaError(11002, error.message);
		}
	}
}

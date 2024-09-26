import {
	Controller,
	Inject,
	Post,
	UploadedFile,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';
import { SingleImgInterceptor } from './interceptors/single-img.interceptor';
import { MultipleImgsInterceptor } from './interceptors/multiple-imgs.interceptor';
import { R2Service } from './r2/r2.service';
import { hanaError } from './error/hanaError';

@Controller('tool')
export class AppController {
	@Inject()
	private readonly r2Service: R2Service;

	@Post('upload-single-img')
	@UseInterceptors(SingleImgInterceptor)
	async uploadImg(@UploadedFile() file: Express.Multer.File) {
		if (!file) throw new hanaError(11004);
		const filePath = file.path;
		const targetPath = 'images' + filePath.split('uploads')[1].replace(/\\/g, '/');
		try {
			const result = await this.r2Service.uploadFileToR2(filePath, targetPath);
			return result;
		} catch (error) {
			throw new hanaError(11001, error.message);
		}
	}

	@Post('upload-multiple-imgs')
	@UseInterceptors(MultipleImgsInterceptor)
	async uploadImgs(@UploadedFiles() files: Express.Multer.File[]) {
		if (!files) throw new hanaError(11004);
		const results = [];
		for (const file of files) {
			const filePath = file.path;
			const targetPath = 'images' + filePath.split('uploads')[1].replace(/\\/g, '/');
			try {
				const result = await this.r2Service.uploadFileToR2(filePath, targetPath);
				results.push(result);
			} catch (error) {
				throw new hanaError(11001, error.message);
			}
		}
		return results;
	}

	@Post('delete-single-img')
	async deleteImg(targetPath: string) {
		try {
			await this.r2Service.deleteFileFromR2(targetPath);
		} catch (error) {
			throw new hanaError(11002, error.message);
		}
	}
}

import {
	Controller,
	Inject,
	Post,
	UploadedFile,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';
import { SingleImgInterceptor } from './interceptors/single-img-interceptor';
import { MultipleImgsInterceptor } from './interceptors/multiple-imgs-interceptor';
import { CosService } from './cos/cos.service';
import { hanaError } from './error/hanaError';
import { RequireLogin } from './decorators/login.decorator';

@Controller('tool')
@RequireLogin()
export class AppController {
	@Inject()
	private readonly cosService: CosService;

	@Post('upload-single-img')
	@UseInterceptors(SingleImgInterceptor)
	async uploadImg(@UploadedFile() file: Express.Multer.File) {
		if (!file) throw new hanaError(11004);
		const filePath = file.path;
		const targetPath = 'images' + filePath.split('uploads')[1].replace(/\\/g, '/');
		try {
			const result = await this.cosService.uploadFileToCos(filePath, targetPath);
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
				const result = await this.cosService.uploadFileToCos(filePath, targetPath);
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
			await this.cosService.deleteFileFromCos(targetPath);
		} catch (error) {
			throw new hanaError(11002, error.message);
		}
	}
}

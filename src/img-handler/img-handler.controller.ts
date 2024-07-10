import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ImgHandlerService } from './img-handler.service';

@Controller('img-handler')
export class ImgHandlerController {
	@Inject(ImgHandlerService)
	private readonly imgHandlerService: ImgHandlerService;

	@Post('generate-thumbnail')
	async generateThumbnail(
		@Body('imageBuffer') imageBuffer: Buffer,
		@Body('fileName') fileName: string,
	) {
		return await this.imgHandlerService.generateThumbnail(imageBuffer, fileName);
	}
}

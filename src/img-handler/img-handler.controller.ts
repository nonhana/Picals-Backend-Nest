import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
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

	// @Get('get-default-image')
	// async getDefaultImage(@Query('text') text: string, @Query('color') color?: string) {
	// 	return await this.imgHandlerService.getDefaultImage(text, color);
	// }
}

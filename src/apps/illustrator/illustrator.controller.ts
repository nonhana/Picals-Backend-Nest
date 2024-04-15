import { Body, Controller, Inject, Post } from '@nestjs/common';
import { IllustratorService } from './illustrator.service';
import { NewIllustratorDto } from './dto/new-illustrator.dto';

@Controller('illustrator')
export class IllustratorController {
	@Inject(IllustratorService)
	private readonly illustratorService: IllustratorService;

	@Post('new')
	async createIllustrator(@Body() newIllustratorDto: NewIllustratorDto) {
		return await this.illustratorService.createItem(newIllustratorDto);
	}
}

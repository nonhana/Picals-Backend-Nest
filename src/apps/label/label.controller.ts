import { Body, Controller, Inject, Post } from '@nestjs/common';
import { LabelService } from './label.service';
import type { NewLabelDto } from './dto/new-label.dto';

@Controller('label')
export class LabelController {
	@Inject(LabelService)
	private readonly labelService: LabelService;

	@Post('new') // 新增标签
	async newLabels(@Body() labels: NewLabelDto[]) {
		return await this.labelService.createItems(labels.map((label) => label.value));
	}
}

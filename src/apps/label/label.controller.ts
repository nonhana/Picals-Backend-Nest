import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { LabelService } from './label.service';
import type { NewLabelDto } from './dto/new-label.dto';
import { LabelItemVO } from './vo/label-item.vo';

@Controller('label')
export class LabelController {
	@Inject(LabelService)
	private readonly labelService: LabelService;

	@Post('new') // 新增标签
	async newLabels(@Body() labels: NewLabelDto[]) {
		return await this.labelService.createItems(labels.map((label) => label.value));
	}

	@Get('recommend') // 获取推荐标签
	async getRecommendLabels() {
		return await this.labelService.getRecommendLabels();
	}

	@Get('detail') // 获取标签详情
	async getLabelDetail(@Query('id') id: string) {
		const label = await this.labelService.findItemById(id);
		return new LabelItemVO(label);
	}
}

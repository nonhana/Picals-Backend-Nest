import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { LabelService } from './label.service';
import type { NewLabelDto } from './dto/new-label.dto';
import { LabelItemVO } from './vo/label-item.vo';
import { AllowVisitor, RequireLogin, UserInfo } from 'src/decorators/login.decorator';
import { JwtUserData } from 'src/guards/auth.guard';
import { UserService } from '../user/user.service';
import { LabelDetailVO } from './vo/label-detail.vo';

@Controller('label')
export class LabelController {
	@Inject(LabelService)
	private readonly labelService: LabelService;

	@Inject(UserService)
	private readonly userService: UserService;

	@Post('new') // 新增标签
	@RequireLogin()
	async newLabels(@Body() labels: NewLabelDto[]) {
		return await this.labelService.createItems(labels.map((label) => label.value));
	}

	@Get('recommend') // 获取推荐标签
	async getRecommendLabels() {
		const source = await this.labelService.getRecommendLabels();
		return source.map((label) => new LabelItemVO(label));
	}

	@Get('list') // 分页获取标签列表
	async getLabelList(@Query('pageSize') pageSize: number, @Query('current') current: number) {
		const source = await this.labelService.getLabelsInPages(pageSize, current);
		return source.map((label) => new LabelItemVO(label));
	}

	@Get('detail') // 获取标签详情
	@AllowVisitor()
	async getLabelDetail(@UserInfo() userInfo: JwtUserData, @Query('name') name: string) {
		const label = await this.labelService.findItemByValue(name);
		if (!label) return null;
		return new LabelDetailVO(
			label,
			userInfo ? await this.userService.isLikedLabel(userInfo.id, label.id) : false,
		);
	}
}

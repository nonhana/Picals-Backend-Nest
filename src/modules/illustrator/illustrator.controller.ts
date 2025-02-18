import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { IllustratorService } from './illustrator.service';
import { NewIllustratorDto } from './dto/new-illustrator.dto';
import { EditIllustratorDto } from './dto/edit-illustrator.dto';
import { IllustratorDetailVo } from './vo/illustrator-detail.vo';
import { RequireLogin, UserInfo } from 'src/decorators/login.decorator';
import { JwtUserData } from 'src/guards/auth.guard';
import { IllustrationItemVO } from '../illustration/vo/illustration-item.vo';
import { UserService } from '../user/user.service';

@Controller('illustrator')
export class IllustratorController {
	@Inject(IllustratorService)
	private readonly illustratorService: IllustratorService;

	@Inject(UserService)
	private readonly userService: UserService;

	@Post('new') // 新增插画家（转载作品需要填写）
	@RequireLogin()
	async createIllustrator(@Body() newIllustratorDto: NewIllustratorDto) {
		await this.illustratorService.createItem(newIllustratorDto);
		return '创建成功！';
	}

	@Post('edit') // 修改插画家信息
	@RequireLogin()
	async editIllustrator(@Query('id') id: string, @Body() editIllustratorDto: EditIllustratorDto) {
		await this.illustratorService.editItem(id, editIllustratorDto);
		return '修改成功！';
	}

	@Get('list') // 分页获取插画家列表
	@RequireLogin()
	async getIllustratorList(@Query('current') current: number, @Query('pageSize') size: number) {
		const illustrators = await this.illustratorService.getIllustratorList(current, size);
		return illustrators.map((illustrator) => new IllustratorDetailVo(illustrator));
	}

	@Get('search') // 搜索插画家
	@RequireLogin()
	async searchIllustrators(@Query('keyword') keyword: string) {
		const illustrators = await this.illustratorService.searchIllustrators(keyword);
		return illustrators.map((illustrator) => new IllustratorDetailVo(illustrator));
	}

	@Get('detail') // 获取插画家详情信息
	async getIllustratorDetail(@Query('id') id: string) {
		const illustrator = await this.illustratorService.findItemById(id);
		return new IllustratorDetailVo(illustrator);
	}

	@Get('works') // 分页获取该插画家的作品列表
	async getIllustratorWorksInPages(
		@UserInfo() userInfo: JwtUserData,
		@Query('id') id: string,
		@Query('current') current: number,
		@Query('pageSize') size: number,
	) {
		const works = await this.illustratorService.getIllustratorWorksInPages(id, current, size);
		return await Promise.all(
			works.map(
				async (work) =>
					new IllustrationItemVO(
						work,
						userInfo ? await this.userService.isLiked(userInfo.id, work.id) : false,
					),
			),
		);
	}

	@Get('works-id') // 获取该插画家的作品id列表
	async getIllustratorWorksId(@Query('id') id: string) {
		return await this.illustratorService.getIllustratorWorksIdList(id);
	}
}

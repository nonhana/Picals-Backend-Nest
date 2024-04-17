import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { IllustrationService } from './illustration.service';
import { UploadIllustrationDto } from './dto/upload-illustration.dto';
import { RequireLogin, UserInfo } from 'src/decorators/login.decorator';
import { JwtUserData } from 'src/guards/auth.guard';
import { UserService } from '../user/user.service';
import { IllustrationItemVO } from './vo/illustration-item.vo';

@Controller('illustration')
export class IllustrationController {
	@Inject(IllustrationService)
	private readonly illustrationService: IllustrationService;

	@Inject(UserService)
	private readonly userService: UserService;

	@Get('recommend') // 分页获取推荐作品列表
	async getRecommend(
		@UserInfo() userInfo: JwtUserData,
		@Query('pageSize') pageSize: number = 1,
		@Query('current') current: number = 30,
	) {
		const works = await this.illustrationService.getItemsInPages(pageSize, current);
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

	@Post('upload') // 上传作品
	@RequireLogin()
	async upload(
		@UserInfo() userInfo: JwtUserData,
		@Body() uploadIllustrationDto: UploadIllustrationDto,
	) {
		const { id } = userInfo;
		return await this.illustrationService.createItem(id, uploadIllustrationDto);
	}

	@Get('following') // 分页获取已关注用户新作
	@RequireLogin()
	async getFollowingWorks(
		@UserInfo() userInfo: JwtUserData,
		@Query('pageSize') pageSize: number = 1,
		@Query('current') current: number = 30,
	) {
		const { id } = userInfo;
		const works = await this.illustrationService.getFollowingWorks(id, pageSize, current);
	}
}

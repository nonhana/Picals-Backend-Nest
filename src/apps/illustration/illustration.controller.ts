import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { IllustrationService } from './illustration.service';
import { UploadIllustrationDto } from './dto/upload-illustration.dto';
import { RequireLogin, UserInfo, Visitor } from 'src/decorators/login.decorator';
import { JwtUserData } from 'src/guards/auth.guard';
import { UserService } from '../user/user.service';
import { IllustrationItemVO } from './vo/illustration-item.vo';
import type { Illustration } from './entities/illustration.entity';
import { IllustrationDetailVO } from './vo/illustration-detail.vo';

@Controller('illustration')
export class IllustrationController {
	@Inject(IllustrationService)
	private readonly illustrationService: IllustrationService;

	@Inject(UserService)
	private readonly userService: UserService;

	convertToIllustrationItemVO = async (
		illustrations: Illustration[],
		userInfo: JwtUserData | undefined,
	) =>
		await Promise.all(
			illustrations.map(
				async (work) =>
					new IllustrationItemVO(
						work,
						userInfo ? await this.userService.isLiked(userInfo.id, work.id) : false,
					),
			),
		);

	@Get('recommend') // 分页获取推荐作品列表
	@Visitor()
	async getRecommend(
		@UserInfo() userInfo: JwtUserData,
		@Query('pageSize') pageSize: number = 1,
		@Query('current') current: number = 30,
	) {
		const works = await this.illustrationService.getItemsInPages(pageSize, current);
		return await this.convertToIllustrationItemVO(works, userInfo);
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
		const records = await this.illustrationService.getFollowingWorks(id, pageSize, current);
		const works = records.map((record) => record.illustration);
		return await this.convertToIllustrationItemVO(works, userInfo);
	}

	@Get('following-count') // 获取已关注用户新作总数
	@RequireLogin()
	async getFollowingWorksCount(@UserInfo() userInfo: JwtUserData) {
		const { id } = userInfo;
		return await this.illustrationService.getFollowingWorksCount(id);
	}

	@Post('edit') // 编辑已发布的作品
	@RequireLogin()
	async edit(
		@UserInfo() userInfo: JwtUserData,
		@Query('id') workId: string,
		@Body() uploadIllustrationDto: UploadIllustrationDto,
	) {
		const { id } = userInfo;
		await this.illustrationService.editItem(id, workId, uploadIllustrationDto);
		return '更新成功！';
	}

	@Get('detail') // 获取作品详情
	@Visitor()
	async getDetail(@UserInfo() userInfo: JwtUserData, @Query('id') workId: string) {
		const work = await this.illustrationService.getDetail(workId);
		console.log('work', work);
		const isLiked = userInfo ? await this.userService.isLiked(userInfo.id, workId) : false;
		const isCollected = userInfo ? await this.userService.isCollected(userInfo.id, workId) : false;
		return new IllustrationDetailVO(work, isLiked, isCollected);
	}

	@Get('simple') // 获取作品简略信息
	async getSimple(@UserInfo() userInfo: JwtUserData, @Query('id') workId: string) {
		const work = await this.illustrationService.getDetail(workId);
		const isLiked = userInfo ? await this.userService.isLiked(userInfo.id, workId) : false;
		return new IllustrationItemVO(work, isLiked);
	}

	@Get('search') // 根据标签分页搜索作品
	async getWorksByLabel(
		@UserInfo() userInfo: JwtUserData,
		@Query('labelName') labelName: string,
		@Query('pageSize') pageSize: number = 30,
		@Query('current') current: number = 1,
	) {
		const works = await this.illustrationService.getItemsByLabelInPages(
			labelName,
			pageSize,
			current,
		);
		return await this.convertToIllustrationItemVO(works, userInfo);
	}

	@Post('view') // 增加作品浏览量
	async view(@Query('id') workId: string) {
		await this.illustrationService.addView(workId);
		return '浏览量增加成功！';
	}
}

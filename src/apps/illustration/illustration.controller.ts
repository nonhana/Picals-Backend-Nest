import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { IllustrationService } from './illustration.service';
import { UploadIllustrationDto } from './dto/upload-illustration.dto';
import { RequireLogin, UserInfo, AllowVisitor } from 'src/decorators/login.decorator';
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
	@AllowVisitor()
	async getRecommend(
		@UserInfo() userInfo: JwtUserData,
		@Query('pageSize') pageSize: number = 1,
		@Query('current') current: number = 30,
	) {
		const works = await this.illustrationService.getItemsInPages(
			pageSize,
			current,
			userInfo ? userInfo.id : undefined,
		);
		return await this.convertToIllustrationItemVO(works, userInfo);
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

	@Get('following-id') // 获取已关注用户新作id列表
	@RequireLogin()
	async getFollowingWorksId(@UserInfo() userInfo: JwtUserData) {
		const { id } = userInfo;
		return await this.illustrationService.getFollowingWorksId(id);
	}

	@Get('following-count') // 获取已关注用户新作总数
	@RequireLogin()
	async getFollowingWorksCount(@UserInfo() userInfo: JwtUserData) {
		const { id } = userInfo;
		return await this.illustrationService.getFollowingWorksCount(id);
	}

	@Post('upload') // 上传作品
	@RequireLogin()
	async upload(
		@UserInfo() userInfo: JwtUserData,
		@Body() uploadIllustrationDto: UploadIllustrationDto,
	) {
		const { id } = userInfo;
		return await this.illustrationService.submitForm(id, uploadIllustrationDto);
	}

	@Post('edit') // 编辑已发布的作品
	@RequireLogin()
	async edit(
		@UserInfo() userInfo: JwtUserData,
		@Query('id') workId: string,
		@Body() uploadIllustrationDto: UploadIllustrationDto,
	) {
		const { id } = userInfo;
		await this.illustrationService.submitForm(id, uploadIllustrationDto, workId);
		return '更新成功！';
	}

	@Post('delete') // 删除已发布的作品
	@RequireLogin()
	async delete(@UserInfo() userInfo: JwtUserData, @Query('id') workId: string) {
		const { id } = userInfo;
		await this.illustrationService.deleteItem(id, workId);
		return '删除成功！';
	}

	@Get('detail') // 获取作品详情
	@AllowVisitor()
	async getDetail(@UserInfo() userInfo: JwtUserData, @Query('id') workId: string) {
		const work = await this.illustrationService.getDetail(workId);
		if (!work) return null;
		const isLiked = userInfo ? await this.userService.isLiked(userInfo.id, workId) : false;
		const isCollected = userInfo ? await this.userService.isCollected(userInfo.id, workId) : false;
		return new IllustrationDetailVO(userInfo ? userInfo.id : undefined, work, isLiked, isCollected);
	}

	@Get('simple') // 获取作品简略信息
	@AllowVisitor()
	async getSimple(@UserInfo() userInfo: JwtUserData, @Query('id') workId: string) {
		const work = await this.illustrationService.getDetail(workId);
		const isLiked = userInfo ? await this.userService.isLiked(userInfo.id, workId) : false;
		return new IllustrationItemVO(work, isLiked);
	}

	@Get('search') // 根据标签分页搜索作品
	@AllowVisitor()
	async getWorksByLabel(
		@UserInfo() userInfo: JwtUserData,
		@Query('labelName') labelName: string,
		@Query('sortType') sortType: string,
		@Query('pageSize') pageSize: number = 30,
		@Query('current') current: number = 1,
	) {
		const works = await this.illustrationService.getItemsByLabelInPages(
			labelName,
			sortType,
			pageSize,
			current,
		);
		return await this.convertToIllustrationItemVO(works, userInfo);
	}

	@Get('search-id') // 搜索作品id列表
	@AllowVisitor()
	async getWorksIdByLabel(
		@Query('labelName') labelName: string,
		@Query('sortType') sortType: string,
	) {
		return await this.illustrationService.getItemsIdByLabel(labelName, sortType);
	}

	@Post('view') // 增加作品浏览量
	async view(@Query('id') workId: string) {
		await this.illustrationService.addView(workId);
		return '浏览量增加成功！';
	}

	@Post('background') // 获取背景图
	async getBackground(@Body('chosenIdList') idList: number[]) {
		return await this.illustrationService.getBackground(idList);
	}

	@Post('url-to-image') // 将图片url转为Image实体存入数据库
	async urlToImage() {
		await this.illustrationService.urlToImage();
		return '转换成功！';
	}
}

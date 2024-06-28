import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { RequireLogin, UserInfo, AllowVisitor } from 'src/decorators/login.decorator';
import { JwtUserData } from 'src/guards/auth.guard';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { EditFavoriteDto } from './dto/edit-favorite.dto';
import { ChangeOrderDto } from './dto/change-order.dto';
import { FavoriteDetailVo } from './vo/favorite-detail.vo';
import { IllustrationItemVO } from '../illustration/vo/illustration-item.vo';
import { UserService } from '../user/user.service';

@Controller('favorite')
export class FavoriteController {
	@Inject(FavoriteService)
	private readonly favoriteService: FavoriteService;

	@Inject(UserService)
	private readonly userService: UserService;

	@Post('new') // 新建收藏夹
	@RequireLogin()
	async createFavorite(
		@UserInfo() userInfo: JwtUserData,
		@Body() createFavoriteDto: CreateFavoriteDto,
	) {
		const { id } = userInfo;
		await this.favoriteService.createFavorite(id, createFavoriteDto);
		return '新建成功！';
	}

	@Post('edit') // 编辑收藏夹信息
	@RequireLogin()
	async editFavorite(
		@UserInfo() userInfo: JwtUserData,
		@Query('id') favoriteId: string,
		@Body() editFavoriteDto: EditFavoriteDto,
	) {
		const { id: userId } = userInfo;
		await this.favoriteService.editFavorite(userId, favoriteId, editFavoriteDto);
		return '编辑成功！';
	}

	@Post('delete') // 删除收藏夹
	@RequireLogin()
	async deleteFavorite(@UserInfo() userInfo: JwtUserData, @Body('id') favoriteId: string) {
		const { id: userId } = userInfo;
		await this.favoriteService.deleteFavorite(userId, favoriteId);
		return '删除成功！';
	}

	@Post('order') // 更改收藏夹的排序
	@RequireLogin()
	async changeOrder(@Body() changeOrderDto: ChangeOrderDto) {
		await this.favoriteService.changeOrder(changeOrderDto);
		return '排序成功！';
	}

	@Get('detail') // 获取某个收藏夹的详细信息
	async getFavoriteDetail(@Query('id') favoriteId: string) {
		const favorite = await this.favoriteService.getFavoriteDetail(favoriteId);
		return new FavoriteDetailVo(favorite);
	}

	@Get('works') // 分页获取某收藏夹的作品列表
	@AllowVisitor()
	async getFavoriteWorksInPages(
		@UserInfo() userInfo: JwtUserData,
		@Query('id') favoriteId: string,
		@Query('current') current: number,
		@Query('pageSize') size: number,
	) {
		const records = await this.favoriteService.getFavoriteWorksInPages(favoriteId, current, size);
		return await Promise.all(
			records.map(
				async (record) =>
					new IllustrationItemVO(
						record.illustration,
						userInfo ? await this.userService.isLiked(userInfo.id, record.illustration.id) : false,
					),
			),
		);
	}

	@Get('search') // 搜索收藏夹内的作品
	@AllowVisitor()
	async searchWorksInFavorite(
		@UserInfo() userInfo: JwtUserData,
		@Query('id') favoriteId: string,
		@Query('keyword') keyword: string,
		@Query('current') current: number,
		@Query('pageSize') size: number,
	) {
		const records = await this.favoriteService.searchWorksInFavorite(
			favoriteId,
			keyword,
			current,
			size,
		);

		return await Promise.all(
			records.map(
				async (record) =>
					new IllustrationItemVO(
						record.illustration,
						await this.userService.isLiked(userInfo.id, record.illustration.id),
					),
			),
		);
	}

	@Get('search-count') // 获取搜索结果数量
	async searchWorksCountInFavorite(
		@Query('id') favoriteId: string,
		@Query('keyword') keyword: string,
	) {
		return await this.favoriteService.searchWorksCountInFavorite(favoriteId, keyword);
	}

	@Post('move') // 移动作品到其他收藏夹
	@RequireLogin()
	async moveCollect(
		@UserInfo() userInfo: JwtUserData,
		@Body('idList') workIds: string[],
		@Body('fromId') fromId: string,
		@Body('toId') toId: string,
	) {
		const { id } = userInfo;
		await this.favoriteService.moveCollect(id, fromId, toId, workIds);
		return '操作成功！';
	}

	@Post('copy') // 复制作品到其他收藏夹
	@RequireLogin()
	async copyCollect(
		@UserInfo() userInfo: JwtUserData,
		@Body('idList') workIds: string[],
		@Body('toId') toId: string,
	) {
		const { id } = userInfo;
		await this.favoriteService.copyCollect(id, toId, workIds);
		return '操作成功！';
	}
}

import { Body, Controller, Inject, Post } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { RequireLogin, UserInfo } from 'src/decorators/login.decorator';
import { JwtUserData } from 'src/guards/auth.guard';
import { CreateFavoriteDto } from './dto/create-favotite.dto';

@Controller('favorite')
export class FavoriteController {
	@Inject(FavoriteService)
	private readonly favoriteService: FavoriteService;

	@Post('new') // 新建收藏夹
	@RequireLogin()
	async createFavorite(
		@UserInfo() userInfo: JwtUserData,
		@Body() createFavoriteDto: CreateFavoriteDto,
	) {
		await this.favoriteService.createFavorite(userInfo.id, createFavoriteDto);
		return '新建成功！';
	}
}

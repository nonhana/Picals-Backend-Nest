import { Controller, Get, Post, Inject, Query, Body } from '@nestjs/common';
import { HistoryService } from './history.service';
import { RequireLogin, UserInfo } from 'src/decorators/login.decorator';
import { JwtUserData } from 'src/guards/auth.guard';
import { HistoryItemVo } from './vo/history-item.vo';

@Controller('history')
@RequireLogin()
export class HistoryController {
	@Inject(HistoryService)
	private readonly historyService: HistoryService;

	@Get('list') // 分页获取用户指定日期的历史记录
	async getHistoryList(
		@UserInfo() userInfo: JwtUserData,
		@Query('date') date: string,
		@Query('pageSize') pageSize: number = 1,
		@Query('current') current: number = 10,
	) {
		const { id } = userInfo;
		const historyList = await this.historyService.getHistoryListInPages(
			id,
			date,
			pageSize,
			current,
		);
		return historyList.map((history) => new HistoryItemVo(history));
	}

	@Get('count') // 获取用户指定日期的历史记录总数
	async getHistoryCount(@UserInfo() userInfo: JwtUserData, @Query('date') date: string) {
		const { id } = userInfo;
		const count = await this.historyService.getHistoryCount(id, date);
		return count;
	}

	@Post('new') // 新增用户历史记录
	async addHistory(@UserInfo() userInfo: JwtUserData, @Body('id') workId: string) {
		const { id } = userInfo;
		await this.historyService.addHistory(id, workId);
		return '新增记录成功！';
	}

	@Post('delete') // 删除某条历史记录
	async deleteHistory(@UserInfo() userInfo: JwtUserData, @Query('id') historyId: string) {
		const { id } = userInfo;
		await this.historyService.deleteHistory(id, historyId);
		return '删除成功！';
	}

	@Post('clear') // 清空用户历史记录
	async clearHistory(@UserInfo() userInfo: JwtUserData) {
		const { id } = userInfo;
		await this.historyService.clearHistory(id);
		return '清空成功！';
	}

	@Get('search') // 根据作品名搜索历史记录
	async searchHistory(@UserInfo() userInfo: JwtUserData, @Query('keyword') keyword: string) {
		const { id } = userInfo;
		const historyList = await this.historyService.searchHistory(id, keyword);
		return historyList.map((history) => new HistoryItemVo(history));
	}
}

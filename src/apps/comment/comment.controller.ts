import { Controller, Get, Post, Body, Inject, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { RequireLogin, UserInfo } from 'src/decorators/login.decorator';
import { JwtUserData } from 'src/guards/auth.guard';
import { CommentItemVO } from './vo/comment-item.vo';

@Controller('comment')
export class CommentController {
	@Inject(CommentService)
	private readonly commentService: CommentService;

	@Get('list') // 获取某个作品的评论列表
	async getCommentList(@Query('id') id: string) {
		const comments = await this.commentService.getCommentList(id);
		return comments.map((comment) => new CommentItemVO(comment));
	}

	@Post('new') // 新增评论
	@RequireLogin()
	async createComment(
		@UserInfo() userInfo: JwtUserData,
		@Body() createCommentDto: CreateCommentDto,
	) {
		const { id } = userInfo;
		await this.commentService.createComment(id, createCommentDto);
		return '评论成功！';
	}

	@Post('delete') // 删除评论
	@RequireLogin()
	async deleteComment(@UserInfo() userInfo: JwtUserData, @Body('id') commentId: string) {
		const { id } = userInfo;
		await this.commentService.deleteComment(id, commentId);
		return '删除成功！';
	}
}

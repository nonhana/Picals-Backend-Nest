import { IsNotEmpty, Length, IsOptional } from 'class-validator';

export class CreateCommentDto {
	@IsNotEmpty({
		message: '作品id不能为空',
	})
	id: string;

	@IsNotEmpty({
		message: '评论内容不能为空',
	})
	@Length(1, 2047, {
		message: '评论内容长度不能大于2047',
	})
	content: string;

	@IsOptional()
	replyInfo?: {
		replyCommentId: string;
		replyUserId?: string;
	};
}

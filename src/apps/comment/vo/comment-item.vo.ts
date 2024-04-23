import type { Comment } from '../entities/comment.entity';

export interface CommentAuthorInfo {
	id: string;
	avatar: string;
	username: string;
}

export interface CommentItem {
	id: string;
	authorInfo: CommentAuthorInfo;
	content: string;
	createdAt: string;
	level: number;
	replyTo?: ReplyInfo;
}

export interface ReplyInfo {
	id: string;
	username: string;
}

export class CommentItemVO {
	id: string;
	authorInfo: CommentAuthorInfo;
	childComments: CommentItem[];
	content: string;
	createdAt: string;
	level: number;
	replyTo?: ReplyInfo;

	constructor(comment: Comment) {
		this.id = comment.id;
		this.authorInfo = {
			id: comment.user.id,
			avatar: comment.user.avatar,
			username: comment.user.username,
		};
		this.content = comment.content;
		this.createdAt = comment.createTime.toISOString();
		this.level = comment.level;
		this.childComments = comment.replies.map((reply) => {
			const result: CommentItem = {
				id: reply.id,
				authorInfo: {
					id: reply.user.id,
					avatar: reply.user.avatar,
					username: reply.user.username,
				},
				content: reply.content,
				createdAt: reply.createTime.toISOString(),
				level: reply.level,
			};
			if (reply.replyToUser) {
				result.replyTo = {
					id: reply.replyToUser.id,
					username: reply.replyToUser.username,
				};
			}
			return result;
		});
	}
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import type { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../user/entities/user.entity';
import { Illustration } from '../illustration/entities/illustration.entity';
import { hanaError } from 'src/error/hanaError';

@Injectable()
export class CommentService {
	@InjectRepository(Comment)
	private readonly commentRepository: Repository<Comment>;

	@InjectRepository(Illustration)
	private readonly illustrationRepository: Repository<Illustration>;

	// 获取某个作品的评论列表
	async getCommentList(id: string) {
		return this.commentRepository.find({
			where: {
				illustration: { id },
				level: 0,
			},
			relations: ['user', 'replies', 'replies.user', 'replies.replyToUser'],
		});
	}

	// 发布评论
	async createComment(userId: string, createCommentDto: CreateCommentDto) {
		const { id: workId, content, replyInfo } = createCommentDto;

		const user = new User();
		user.id = userId;

		const work = await this.illustrationRepository.findOneBy({ id: workId });

		const comment = new Comment();
		comment.content = content;
		comment.user = user;
		comment.illustration = work;

		if (!replyInfo) {
			// 1. 一级评论
			comment.level = 0;
		} else {
			// 2. 二级评论
			comment.level = 1;
			const replyComment = new Comment();
			replyComment.id = replyInfo.replyCommentId;
			comment.replyTo = replyComment;
			// 3. 二级评论回复的用户
			if (replyInfo.replyUserId) {
				const replyUser = new User();
				replyUser.id = replyInfo.replyUserId;
				comment.replyToUser = replyUser;
			}
		}
		await this.commentRepository.save(comment);

		work.commentCount++;
		await this.illustrationRepository.save(work);

		return;
	}

	// 删除某条评论
	async deleteComment(userId: string, commentId: string) {
		const comment = await this.commentRepository.findOne({
			where: { id: commentId },
			relations: ['user'],
		});
		if (!comment) throw new hanaError(10701);
		if (comment.user.id !== userId) throw new hanaError(10702);
		await this.commentRepository.delete(commentId);

		const work = await this.illustrationRepository.findOneBy({ id: comment.illustration.id });
		work.commentCount--;
		await this.illustrationRepository.save(work);
		return;
	}
}

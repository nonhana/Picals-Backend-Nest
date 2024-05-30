// /src/comment/entities/comment.entity.ts
// 评论实体

import { Illustration } from 'src/apps/illustration/entities/illustration.entity';
import { User } from 'src/apps/user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryColumn,
} from 'typeorm';

@Entity({
	name: 'comments',
})
export class Comment {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '评论id，采用uuid的形式',
	})
	id: string;

	@Column({
		type: 'varchar',
		length: 2047,
		comment: '评论内容',
	})
	content: string;

	@Column({
		type: 'int',
		comment: '评论等级，0为一级评论，1为二级评论',
	})
	level: number;

	@CreateDateColumn({
		type: 'timestamp',
		comment: '评论创建时间',
	})
	createTime: Date;

	@ManyToOne(() => Comment, (comment) => comment.replies)
	@JoinColumn({ name: 'res_to_comment_id' })
	replyTo: Comment; // 这条评论回复的评论

	@ManyToOne(() => User, {
		nullable: true,
	})
	@JoinColumn({ name: 'res_to_user_id' })
	replyToUser: User; // 这条评论回复的用户（仅当二级评论回复他人时有值，便于区分）

	@OneToMany(() => Comment, (comment) => comment.replyTo, {
		cascade: true,
	})
	replies: Comment[]; // 回复这条评论的评论

	@ManyToOne(() => User, (user) => user.comments, {
		nullable: true,
	})
	@JoinColumn({ name: 'user_id' })
	user: User; // 评论作者

	@ManyToOne(() => Illustration, (illustration) => illustration.comments)
	@JoinColumn({ name: 'illustration_id' })
	illustration: Illustration; // 评论所属作品
}

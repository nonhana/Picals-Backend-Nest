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
		length: 255,
		comment: '评论内容',
	})
	content: string;

	@CreateDateColumn({
		type: 'timestamp',
		comment: '评论创建时间',
	})
	createTime: Date;

	@ManyToOne(() => Comment, (comment) => comment.replies)
	@JoinColumn({ name: 'res_to_comment_id' })
	replyTo: Comment;

	@OneToMany(() => Comment, (comment) => comment.replyTo, {
		cascade: true,
	})
	replies: Comment[];

	@ManyToOne(() => User, (user) => user.comments, {
		nullable: true,
	})
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Illustration, (illustration) => illustration.comments)
	@JoinColumn({ name: 'illustration_id' })
	illustration: Illustration;
}

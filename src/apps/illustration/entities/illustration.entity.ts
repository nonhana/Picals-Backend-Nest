// /src/illustration/entities/illustration.entity.ts
// 插画实体

import { Comment } from 'src/apps/comment/entities/comment.entity';
import { Favorite } from 'src/apps/favorite/entities/favorite.entity';
import { History } from 'src/apps/history/entities/history.entity';
import { Illustrator } from 'src/apps/illustrator/entities/illustrator.entity';
import { Label } from 'src/apps/label/entities/label.entity';
import { User } from 'src/apps/user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity({
	name: 'illustrations',
})
export class Illustration {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '插画id，采用uuid的形式',
	})
	id: string;

	@Column({
		type: 'varchar',
		length: 63,
		comment: '插画名',
	})
	name: string;

	@Column({
		type: 'varchar',
		length: 2047,
		comment: '插画简介',
	})
	intro: string;

	@Column({
		type: 'tinyint',
		comment: '转载类型。0-原创，1-转载，2-合集',
	})
	reprintType: number;

	@Column({
		type: 'boolean',
		comment: '是否开启评论',
	})
	openComment: boolean;

	@Column({
		type: 'boolean',
		comment: '是否为AI生成作品',
	})
	isAIGenerated: boolean;

	@Column('simple-array', {
		comment: '插画的作品列表',
	})
	imgList: string[];

	@Column({
		type: 'varchar',
		length: 255,
		comment: '插画封面URL',
	})
	cover: string;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '插画原图URL',
		nullable: true,
		name: 'original_url',
	})
	workUrl: string;

	@Column({
		type: 'int',
		comment: '插画点赞数量',
		default: 0,
		name: 'like_count',
	})
	likeCount: number;

	@Column({
		type: 'int',
		comment: '插画观看数量',
		default: 0,
		name: 'view_count',
	})
	viewCount: number;

	@Column({
		type: 'int',
		comment: '插画收藏数量',
		default: 0,
		name: 'collect_count',
	})
	collectCount: number;

	@Column({
		type: 'int',
		comment: '插画评论数量',
		default: 0,
		name: 'comment_count',
	})
	commentCount: number;

	@CreateDateColumn({
		type: 'timestamp',
		comment: '插画创建时间',
		name: 'created_time',
	})
	createdTime: Date;

	@UpdateDateColumn({
		type: 'timestamp',
		comment: '插画更新时间',
		name: 'updated_time',
	})
	updatedTime: Date;

	@ManyToOne(() => User, (user) => user.illustrations, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Illustrator, (illustrator) => illustrator.illustrations, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'illustrator_id' })
	illustrator: Illustrator;

	@ManyToMany(() => Label, (label) => label.illustrations, {
		cascade: true,
		onDelete: 'CASCADE',
	})
	@JoinTable()
	labels: Label[];

	@ManyToMany(() => User, (user) => user.likeWorks, {
		onDelete: 'CASCADE',
	})
	likeUsers: User[];

	@OneToMany(() => Comment, (comment) => comment.illustration)
	comments: Comment[];

	@OneToMany(() => History, (history) => history.illustration)
	histories: History[];

	@ManyToMany(() => Favorite, (favorite) => favorite.illustrations, {
		cascade: true,
		onDelete: 'CASCADE',
	})
	@JoinTable()
	favorites: Favorite[];
}

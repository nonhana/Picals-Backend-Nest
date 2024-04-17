// /src/user/entities/user.entity.ts
// 用户实体

import { Illustration } from 'src/apps/illustration/entities/illustration.entity';
import { Label } from 'src/apps/label/entities/label.entity';
import { Comment } from 'src/apps/comment/entities/comment.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryColumn,
} from 'typeorm';
import { History } from 'src/apps/history/entities/history.entity';
import { Favorite } from 'src/apps/favorite/entities/favorite.entity';

@Entity({
	name: 'users',
})
export class User {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '用户id，采用uuid的形式',
	})
	id: string;

	@Column({
		type: 'varchar',
		length: 31,
		comment: '用户名',
		default: '默认用户名',
	})
	username: string;

	@Column({
		type: 'varchar',
		length: 125,
		comment: '用户邮箱',
	})
	email: string;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '用户密码',
	})
	password: string;

	@Column({
		type: 'varchar',
		length: 127,
		comment: '用户背景图片URL地址',
		name: 'background_img',
		default: 'https://dummyimage.com/400X400',
	})
	backgroundImg: string;

	@Column({
		type: 'varchar',
		length: 127,
		comment: '用户头像图片URL地址',
		default: 'https://dummyimage.com/400X400',
	})
	avatar: string;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '用户签名',
		default: '请多多指教！~',
	})
	signature: string;

	@Column({
		type: 'boolean',
		comment: '用户性别，0-男，1-女，2-未知',
		default: 2,
	})
	gender: number;

	@Column({
		type: 'int',
		comment: '用户粉丝数',
		name: 'fan_count',
		default: 0,
	})
	fanCount: number;

	@Column({
		type: 'int',
		comment: '用户关注数',
		name: 'follow_count',
		default: 0,
	})
	followCount: number;

	@Column({
		type: 'int',
		comment: '用户原创作品数',
		name: 'origin_count',
		default: 0,
	})
	originCount: number;

	@Column({
		type: 'int',
		comment: '用户转载作品数',
		name: 'reprinted_count',
		default: 0,
	})
	reprintedCount: number;

	@Column({
		type: 'int',
		comment: '用户喜欢作品数',
		name: 'like_count',
		default: 0,
	})
	likeCount: number;

	@Column({
		type: 'int',
		comment: '用户收藏作品数',
		name: 'collect_count',
		default: 0,
	})
	collectCount: number;

	@Column({
		type: 'int',
		comment: '用户收藏夹数',
		name: 'favorite_count',
		default: 0,
	})
	favoriteCount: number;

	@CreateDateColumn({
		type: 'timestamp',
		comment: '用户创建时间',
		name: 'created_time',
	})
	createdTime: Date;

	@CreateDateColumn({
		type: 'timestamp',
		comment: '用户更新时间',
		name: 'updated_time',
	})
	updatedTime: Date;

	@ManyToMany(() => User, (user) => user.followers)
	@JoinTable()
	following: User[];

	@ManyToMany(() => User, (user) => user.following)
	followers: User[];

	@OneToMany(() => Illustration, (illustration) => illustration.user, {
		onDelete: 'SET NULL',
	})
	illustrations: Illustration[];

	@ManyToMany(() => Label, (label) => label.users)
	@JoinTable()
	likedLabels: Label[];

	@ManyToMany(() => Illustration, (illustration) => illustration.likeUsers)
	@JoinTable()
	likeWorks: Illustration[];

	@OneToMany(() => Comment, (comment) => comment.user, {
		onDelete: 'SET NULL',
	})
	comments: Comment[];

	@OneToMany(() => History, (history) => history.user, {
		cascade: true,
	})
	histories: History[];

	@OneToMany(() => Favorite, (favorite) => favorite.user, {
		onDelete: 'SET NULL',
	})
	favorites: Favorite[];
}

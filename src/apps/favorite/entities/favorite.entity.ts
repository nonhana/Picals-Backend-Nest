// /src/favorite/entities/favorite.entity.ts
// 收藏夹实体

import { Illustration } from 'src/apps/illustration/entities/illustration.entity';
import { User } from 'src/apps/user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToMany,
	ManyToOne,
	PrimaryColumn,
} from 'typeorm';

@Entity({
	name: 'favorites',
})
export class Favorite {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '收藏夹id，采用uuid的形式',
	})
	id: string;

	@Column({
		type: 'varchar',
		length: 31,
		comment: '收藏夹名称',
	})
	name: string;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '收藏夹简介',
	})
	introduce: string;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '收藏夹封面图片URL地址',
		default: null,
		nullable: true,
	})
	cover: string;

	@Column({
		type: 'int',
		comment: '收藏夹顺序（从0开始）',
	})
	order: number;

	@Column({
		type: 'int',
		comment: '收藏夹内的作品数量',
		name: 'work_count',
	})
	workCount: number;

	@CreateDateColumn({
		type: 'timestamp',
		comment: '收藏夹创建时间',
		name: 'created_at',
	})
	createdAt: Date;

	@CreateDateColumn({
		type: 'timestamp',
		comment: '收藏夹更新时间',
		name: 'updated_at',
	})
	updatedAt: Date;

	@ManyToOne(() => User, (user) => user.favorites)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToMany(() => Illustration, (illustration) => illustration.favorites, {
		onDelete: 'CASCADE',
	})
	illustrations: Illustration[];
}

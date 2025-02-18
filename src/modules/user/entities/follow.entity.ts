// /src/user/entities/follow.entity.ts
// 用户关注关系的中间表

import { User } from '@/modules/user/entities/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity({
	name: 'users_following_users',
})
export class Follow {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '采用uuid的形式',
	})
	id: string;

	@ManyToOne(() => User, (user) => user.followers, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'follower_id' })
	follower: User;

	@ManyToOne(() => User, (user) => user.following, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'following_id' })
	following: User;

	@CreateDateColumn({
		comment: '关注时间',
	})
	followTime: Date;
}

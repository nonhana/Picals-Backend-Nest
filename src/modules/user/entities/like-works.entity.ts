// /src/user/entities/like-works.entity.ts
// 用户喜欢的作品中间表

import { Illustration } from '@/modules/illustration/entities/illustration.entity';
import { User } from '@/modules/user/entities/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity({
	name: 'users_like_works_illustrations',
})
export class LikeWorks {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '采用uuid的形式',
	})
	id: string;

	@ManyToOne(() => User, (user) => user.likeWorks, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Illustration, (illustration) => illustration.likeUsers, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'illustration_id' })
	illustration: Illustration;

	@CreateDateColumn({
		comment: '喜欢时间',
	})
	likeTime: Date;
}

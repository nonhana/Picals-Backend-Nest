// /src/illustration/entities/work-temp.entity.ts
// 推送插画记录暂存实体

import { Illustration } from 'src/apps/illustration/entities/illustration.entity';
import { User } from 'src/apps/user/entities/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity({
	name: 'work_push_temp',
})
export class WorkPushTemp {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '采用uuid的形式',
	})
	id: string;

	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'author_id' })
	author: User;

	@ManyToOne(() => User, (user) => user.recordWorks, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'user_id' })
	user: User;

	// 插画指的是插画家发布的新作
	@ManyToOne(() => Illustration, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'illustration_id' })
	illustration: Illustration;
}

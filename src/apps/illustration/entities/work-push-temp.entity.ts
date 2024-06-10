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

	// 这个用户指的是插画家发布新作之后推送给的粉丝
	@ManyToOne(() => User, (user) => user.recordWorks, {
		onDelete: 'CASCADE', // 删除用户的同时删除推送记录
	})
	@JoinColumn({ name: 'user_id' })
	user: User;

	// 插画指的是插画家发布的新作
	@ManyToOne(() => Illustration, {
		onDelete: 'CASCADE', // 删除插画的同时删除推送记录
	})
	@JoinColumn({ name: 'illustration_id' })
	illustration: Illustration;
}

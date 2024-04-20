// /src/illustration/entities/work-temp.entity.ts
// 暂存插画记录实体

import { Illustration } from 'src/apps/illustration/entities/illustration.entity';
import { User } from 'src/apps/user/entities/user.entity';
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity({
	name: 'work_temp',
})
export class WorkTemp {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '采用uuid的形式',
	})
	id: string;

	@CreateDateColumn({
		type: 'timestamp',
		comment: '创建时间',
		name: 'created_at',
	})
	createdAt: Date;

	// 这个用户指的是插画家发布新作之后推送给的粉丝
	@ManyToOne(() => User, (user) => user.recordWorks)
	@JoinColumn({ name: 'user_id' })
	user: User;

	// 插画指的是插画家发布的新作
	@ManyToOne(() => Illustration, {
		cascade: true,
	})
	@JoinColumn({ name: 'illustration_id' })
	illustration: Illustration;
}

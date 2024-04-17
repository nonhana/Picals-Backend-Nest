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

	@ManyToOne(() => User, (user) => user.recordWorks, {
		cascade: true,
	})
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Illustration, {
		cascade: true,
	})
	@JoinColumn({ name: 'illustration_id' })
	illustration: Illustration;
}

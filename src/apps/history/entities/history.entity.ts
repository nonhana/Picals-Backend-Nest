// /src/history/entities/history.entity.ts
// 历史记录实体

import { Illustration } from 'src/apps/illustration/entities/illustration.entity';
import { User } from 'src/apps/user/entities/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({
	name: 'history',
})
export class History {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '历史记录id，采用uuid的形式',
	})
	id: string;

	@UpdateDateColumn({
		type: 'timestamp',
		comment: '最后访问时间',
		name: 'last_time',
	})
	lastTime: Date;

	@ManyToOne(() => User, (user) => user.histories, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Illustration, (illustration) => illustration.histories, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'illustration_id' })
	illustration: Illustration;
}

// /src/favorite/entities/collect-record.entity.ts
// 收藏记录实体

import { Illustration } from 'src/apps/illustration/entities/illustration.entity';
import { User } from 'src/apps/user/entities/user.entity';
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity({
	name: 'collect_records',
})
export class CollectRecord {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '主键id，采用uuid的形式',
	})
	id: string;

	@CreateDateColumn({
		type: 'timestamp',
		comment: '收藏时间',
		name: 'created_at',
	})
	createdAt: Date;

	@ManyToOne(() => User, {
		cascade: true,
	})
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Illustration, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'illustration_id' })
	illustration: Illustration;
}

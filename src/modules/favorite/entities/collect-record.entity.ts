// /src/favorite/entities/collect-record.entity.ts
// 收藏记录实体

import { Illustration } from '@/modules/illustration/entities/illustration.entity';
import { User } from '@/modules/user/entities/user.entity';
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Favorite } from './favorite.entity';

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

	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Illustration, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'illustration_id' })
	illustration: Illustration;

	@ManyToOne(() => Favorite, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'favorite_id' })
	favorite: Favorite;

	@CreateDateColumn({
		type: 'timestamp',
		comment: '收藏时间',
		name: 'created_at',
	})
	createdAt: Date;
}

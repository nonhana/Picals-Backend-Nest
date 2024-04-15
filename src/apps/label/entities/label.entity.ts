// /src/label/entities/label.entity.ts
// 标签实体

import { Illustration } from 'src/apps/illustration/entities/illustration.entity';
import { User } from 'src/apps/user/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity({
	name: 'labels',
})
export class Label {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '标签id，采用uuid的形式',
	})
	id: string;

	@Column({
		type: 'varchar',
		length: 31,
		comment: '标签名',
	})
	value: string;

	@Column({
		type: 'varchar',
		length: 7,
		comment: '标签颜色，采用hex的格式',
	})
	color: string;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '标签背景图',
		nullable: true,
	})
	cover: string;

	@ManyToMany(() => User, (user) => user.likedLabels)
	users: User[];

	@ManyToMany(() => Illustration, (illustration) => illustration.labels)
	illustrations: Illustration[];
}

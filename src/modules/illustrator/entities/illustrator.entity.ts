// /src/illustrator/entities/illustrator.entity.ts
// 插画家实体

import { Illustration } from '@/modules/illustration/entities/illustration.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity({
	name: 'illustrators',
})
export class Illustrator {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '插画家id，采用uuid的形式',
	})
	id: string;

	@Column({
		type: 'varchar',
		length: 31,
		comment: '插画家名字',
	})
	name: string;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '插画家头像地址URL',
		nullable: true,
	})
	avatar: string;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '插画家头像缩略图地址URL',
		name: 'little_avatar',
		nullable: true,
		default: null,
	})
	littleAvatar: string;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '插画家简介',
		default: '暂无简介',
	})
	intro: string;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '插画家主页地址URL',
		name: 'home_url',
	})
	homeUrl: string;

	@Column({
		type: 'int',
		comment: '插画家作品数量',
		default: 0,
		name: 'work_count',
	})
	workCount: number;

	@Column({
		type: 'boolean',
		comment: '插画家状态，0-正常，1-删除',
		name: 'status',
		default: 0,
	})
	status: number;

	@CreateDateColumn({
		type: 'timestamp',
		comment: '插画家创建时间',
		name: 'created_time',
	})
	createdTime: Date;

	@UpdateDateColumn({
		type: 'timestamp',
		comment: '插画家更新时间',
		name: 'updated_time',
	})
	updatedTime: Date;

	@OneToMany(() => Illustration, (illustration) => illustration.illustrator)
	illustrations: Illustration[];
}

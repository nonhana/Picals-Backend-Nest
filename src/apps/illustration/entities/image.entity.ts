// /src/illustration/entities/image.entity.ts
// 图片信息实体

import { Illustration } from 'src/apps/illustration/entities/illustration.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity({
	name: 'images',
})
export class Image {
	@PrimaryColumn({
		type: 'uuid',
		generated: 'uuid',
		comment: '采用uuid的形式',
	})
	id: string;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '原图地址',
	})
	originUrl: string;

	@Column({
		type: 'int',
		width: 11,
		comment: '原图宽度',
	})
	originWidth: number;

	@Column({
		type: 'int',
		width: 11,
		comment: '原图高度',
	})
	originHeight: number;

	@Column({
		type: 'varchar',
		length: 255,
		comment: '缩略图地址',
	})
	thumbnailUrl: string;

	@Column({
		type: 'int',
		width: 11,
		comment: '缩略图宽度',
	})
	thumbnailWidth: number;

	@Column({
		type: 'int',
		width: 11,
		comment: '缩略图高度',
	})
	thumbnailHeight: number;

	@ManyToOne(() => Illustration, (Illustration) => Illustration.images, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'illustration_id' })
	illustration: Illustration;
}

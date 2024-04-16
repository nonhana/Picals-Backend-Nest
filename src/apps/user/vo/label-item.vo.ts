import type { Label } from 'src/apps/label/entities/label.entity';

export class LabelItemVO {
	id: string;
	name: string;
	img: string | null;
	color: string;

	constructor(label: Label) {
		this.id = label.id;
		this.name = label.value;
		this.img = label.cover;
		this.color = label.color;
	}
}

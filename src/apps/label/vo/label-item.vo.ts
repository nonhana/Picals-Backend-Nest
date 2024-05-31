import type { Label } from 'src/apps/label/entities/label.entity';

export class LabelItemVO {
	id: string;
	name: string;
	cover: string | null;
	color: string;

	constructor(label: Label) {
		this.id = label.id;
		this.name = label.value;
		this.cover = label.cover;
		this.color = label.color;
	}
}

import type { Label } from '@/modules/label/entities/label.entity';

export class LabelDetailVO {
	/**
	 * 标签颜色，由后台进行随机不重复的颜色生成
	 */
	color: string;
	/**
	 * 标签id
	 */
	id: string;
	/**
	 * 标签封面图片，当该标签的作品数达到一定量级后，由管理员在后台进行上传，默认就是随机生成的纯色背景图
	 */
	cover: string | null;
	/**
	 * 是否是我喜欢的标签
	 */
	isMyLike: boolean;
	/**
	 * 标签名称
	 */
	name: string;
	/**
	 * 该标签下的作品总数
	 */
	workCount: number;
	constructor(label: Label, isMyLike: boolean) {
		this.id = label.id;
		this.name = label.value;
		this.cover = label.cover;
		this.color = label.color;
		this.workCount = label.workCount;
		this.isMyLike = isMyLike;
	}
}

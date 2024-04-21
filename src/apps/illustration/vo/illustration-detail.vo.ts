import type { Illustration } from 'src/apps/illustration/entities/illustration.entity';

/**
 * LabelItem
 */
export interface LabelItem {
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
	img: null | string;
	/**
	 * 标签名称
	 */
	name: string;
}

export class IllustrationDetailVO {
	/**
	 * 作品id
	 */
	id: string;
	/**
	 * 作者id
	 */
	authorId: string;
	/**
	 * 作品图片url列表
	 */
	imgList: string[];
	/**
	 * 作品简介
	 */
	intro: string;
	/**
	 * 是否是AI生成作品
	 */
	isAIGenerated: boolean;
	/**
	 * 是否已经收藏
	 */
	isCollected: boolean;
	/**
	 * 用户是否已经喜欢
	 */
	isLiked: boolean;
	/**
	 * 标签列表
	 */
	labels: LabelItem[];
	/**
	 * 作品名称
	 */
	name: string;
	/**
	 * 是否打开评论
	 */
	openComment: boolean;

	constructor(illustration: Illustration, isLiked: boolean, isCollected: boolean) {
		this.id = illustration.id;
		this.authorId = illustration.user.id;
		this.imgList = illustration.imgList;
		this.intro = illustration.intro;
		this.isAIGenerated = illustration.isAIGenerated;
		this.isCollected = isCollected;
		this.isLiked = isLiked;
		this.labels = illustration.labels.map((label) => ({
			color: label.color,
			id: label.id,
			img: label.cover,
			name: label.value,
		}));
		this.name = illustration.name;
		this.openComment = illustration.openComment;
	}
}

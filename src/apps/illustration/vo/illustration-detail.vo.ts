import type { Illustration } from 'src/apps/illustration/entities/illustration.entity';
import { formatDate } from 'src/utils';

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
	 * 作者id
	 */
	authorId: string;
	/**
	 * 被收藏次数
	 */
	collectNum: number;
	/**
	 * 评论个数
	 */
	commentNum: number;
	/**
	 * 创建日期
	 */
	createdDate: string;
	/**
	 * 作品id
	 */
	id: string;
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
	 * 已经被收藏的收藏夹id，如果没有被收藏则不传
	 */
	favoriteId?: string;
	/**
	 * 用户是否已经喜欢
	 */
	isLiked: boolean;
	/**
	 * 是否是转载作品
	 */
	isReprinted: boolean;
	/**
	 * 标签列表
	 */
	labels: LabelItem[];
	/**
	 * 被喜欢次数
	 */
	likeNum: number;
	/**
	 * 作品名称
	 */
	name: string;
	/**
	 * 是否打开评论
	 */
	openComment: boolean;
	/**
	 * 更新日期
	 */
	updatedDate: string;
	/**
	 * 被浏览次数
	 */
	viewNum: number;

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
		this.updatedDate = formatDate(illustration.updatedTime);
		this.createdDate = formatDate(illustration.createdTime);
		this.likeNum = illustration.likeCount;
		this.collectNum = illustration.collectCount;
		this.commentNum = illustration.commentCount;
		this.isReprinted = illustration.isReprinted;
		this.viewNum = illustration.viewCount;
		if (isCollected) this.favoriteId = illustration.favorites[0].id;
	}
}

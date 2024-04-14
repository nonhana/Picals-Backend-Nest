import type { User } from '../entities/user.entity';
import { formatDate } from 'src/utils';

export class DetailUserVo {
  /**
   * 用户头像
   */
  avatar: string;
  /**
   * 用户背景图
   */
  backgroundImg: string;
  /**
   * 用户收藏的作品数
   */
  collectCount: number;
  /**
   * 用户账户的创建时间
   */
  createdTime: string;
  /**
   * 用户邮箱
   */
  email: string;
  /**
   * 用户粉丝数
   */
  fanCount: number;
  /**
   * 用户的收藏夹数量
   */
  favoriteCount: number;
  /**
   * 用户关注数
   */
  followCount: number;
  /**
   * 用户性别，0-男，1-女，2-未知
   */
  gender: number;
  /**
   * 用户id
   */
  id: string;
  /**
   * 用户喜欢的作品数
   */
  likeCount: number;
  /**
   * 用户发布的原创作品数
   */
  originCount: number;
  /**
   * 用户发布的转载作品数
   */
  reprintedCount: number;
  /**
   * 用户签名
   */
  signature: string;
  /**
   * 用户名
   */
  username: string;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.avatar = user.avatar;
    this.backgroundImg = user.backgroundImg;
    this.gender = user.gender;
    this.likeCount = user.likeCount;
    this.collectCount = user.collectCount;
    this.originCount = user.originCount;
    this.reprintedCount = user.reprintedCount;
    this.fanCount = user.fanCount;
    this.followCount = user.followCount;
    this.favoriteCount = user.favoriteCount;
    this.createdTime = formatDate(user.createdTime);
    this.signature = user.signature;
  }
}

// /src/illustration/entities/illustration.entity.ts
// 插画实体

import { Comment } from 'src/comment/entities/comment.entity';
import { History } from 'src/history/entities/history.entity';
import { Illustrator } from 'src/illustrator/entities/illustrator.entity';
import { Label } from 'src/label/entities/label.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity({
  name: 'illustrations',
})
export class Illustration {
  @PrimaryColumn({
    type: 'uuid',
    generated: 'uuid',
    comment: '插画id，采用uuid的形式',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 63,
    comment: '插画名',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '插画简介',
  })
  introduce: string;

  @Column({
    type: 'boolean',
    comment: '是否为转载作品',
  })
  isReprinted: boolean;

  @Column({
    type: 'boolean',
    comment: '是否开启评论',
  })
  openComment: boolean;

  @Column({
    type: 'boolean',
    comment: '是否为AI生成作品',
  })
  isAIGenerated: boolean;

  @Column('simple-array', {
    comment: '插画的作品列表',
  })
  workList: string[];

  @Column({
    type: 'int',
    comment: '插画点赞数量',
    default: 0,
    name: 'like_count',
  })
  likeCount: number;

  @Column({
    type: 'int',
    comment: '插画观看数量',
    default: 0,
    name: 'view_count',
  })
  viewCount: number;

  @Column({
    type: 'int',
    comment: '插画收藏数量',
    default: 0,
    name: 'collect_count',
  })
  collectCount: number;

  @Column({
    type: 'int',
    comment: '插画评论数量',
    default: 0,
    name: 'comment_count',
  })
  commentCount: number;

  @CreateDateColumn({
    type: 'timestamp',
    comment: '插画创建时间',
    name: 'created_time',
  })
  createdTime: Date;

  @CreateDateColumn({
    type: 'timestamp',
    comment: '插画更新时间',
    name: 'updated_time',
  })
  updatedTime: Date;

  // 关联到User表，一个用户可以有多个插画
  @ManyToOne(() => User, (user) => user.illustrations, {
    nullable: true, // 可以为空，当删除用户之后，插画还在，只是找不到用户了
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 关联到Illustrator表，一个插画家可以有多个插画
  @ManyToOne(() => Illustrator, (illustrator) => illustrator.illustrations, {
    nullable: true, // 同上
  })
  @JoinColumn({ name: 'illustrator_id' })
  illustrator: Illustrator;

  @ManyToMany(() => Label, (label) => label.illustrations)
  @JoinTable()
  labels: Label[];

  @OneToMany(() => Comment, (comment) => comment.illustration, {
    cascade: true,
  })
  comments: Comment[];

  @OneToMany(() => History, (history) => history.illustration, {
    cascade: true,
  })
  histories: History[];
}

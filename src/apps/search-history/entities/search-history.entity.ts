// /src/search-history/entities/search-history.entity.ts
// 搜索历史记录实体

import { User } from 'src/apps/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity({
  name: 'search_history',
})
export class SearchHistory {
  @PrimaryColumn({
    type: 'uuid',
    generated: 'uuid',
    comment: '搜索历史记录id，采用uuid的形式',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '搜索内容',
  })
  content: string;

  @CreateDateColumn({
    type: 'timestamp',
    comment: '搜索时间',
    name: 'search_time',
  })
  searchTime: Date;

  @ManyToOne(() => User, (user) => user.searchHistories)
  @JoinTable({ name: 'user_id' })
  user: User;
}

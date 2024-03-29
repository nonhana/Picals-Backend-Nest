// /src/history/entities/history.entity.ts
// 历史记录实体

import { Illustration } from 'src/illustration/entities/illustration.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'history',
})
export class History {
  @PrimaryColumn({
    type: 'uuid',
    generated: 'uuid',
    comment: '历史记录id，采用uuid的形式',
  })
  id: string;

  @Column({
    type: 'timestamp',
    comment: '最后访问时间',
  })
  lastTime: Date;

  @ManyToOne(() => User, (user) => user.histories)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Illustration, (illustration) => illustration.histories)
  @JoinColumn({ name: 'illustration_id' })
  illustration: Illustration;
}

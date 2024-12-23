import { BaseTable } from 'src/common/entities/base-table.entity';
import { Community } from 'src/community/entities/community.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Comment extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.comment, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Community, (community) => community.comment, {
    onDelete: 'CASCADE',
  })
  community: Community;
}

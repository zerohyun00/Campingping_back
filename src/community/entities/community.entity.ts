import { Exclude } from 'class-transformer';
import { Comment } from 'src/comment/entities/comment.entity';
import { BaseTable } from 'src/common/entities/base-table.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  Geometry,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';

@Entity()
export class Community extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  location: string;

  @Column()
  people: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: 0 })
  view: number;
  
  @Column({type: 'geometry'})
  coordinate: Geometry;

  @ManyToOne(() => User, (user) => user.community)
  user: User;

  @OneToMany(() => Comment, (comment) => comment.community)
  comment: Comment[];

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}

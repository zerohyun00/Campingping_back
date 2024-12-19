import { Exclude } from 'class-transformer';
import { Comment } from 'src/comment/entites/comment.entity';
import { BaseTable } from 'src/common/entities/base-table.entity';
import { Community } from 'src/community/entities/community.entity';
import { Review } from 'src/review/entities/review.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  admin,
  user,
}

export enum LoginType {
  NORMAL = 'NORMAL',
  KAKAO = 'KAKAO',
}
@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  @Exclude({
    toPlainOnly: true, // 응답을 할 때 적용
  })
  password?: string;

  @Column({
    enum: Role,
    default: Role.user,
  })
  role: Role;

  @Column({
    nullable: true,
  })
  nickname: string;

  @Column({
    type: 'enum',
    enum: LoginType,
    default: LoginType.NORMAL,
  })
  type: LoginType;

  @OneToMany(() => Comment, (comment) => comment.user)
  comment: Comment[];
  
  @OneToMany(() => Community, (community) => community.user)
  community: Community[];

  @OneToMany(() => Review, (review) => review.user)
  review: Review[];
}

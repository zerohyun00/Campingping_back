import { Exclude } from 'class-transformer';
import { Comment } from 'src/comment/entities/comment.entity';
import { Community } from 'src/community/entities/community.entity';
import { Review } from 'src/review/entities/review.entity';
import { ChatRoom } from 'src/chat/entities/chat-room.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { BaseTable } from 'src/common/entities/base-table.entity';
import { Favorite } from 'src/favorite/entities/favorite.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum Role {
  ADMIN,
  USER,
}

export enum LoginType {
  NORMAL = 'NORMAL',
  KAKAO = 'KAKAO',
}

export interface PushSubscriptions {
  endpoint: string; // 푸시 서버의 URL
  expirationTime: number | null; // 구독 만료 시간 (null 가능)
  keys: {
    p256dh: string; // 공개 키
    auth: string; // 인증 키
  };
}
@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn('uuid')
  @Exclude({
    toPlainOnly: true,
  })
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
    default: Role.USER,
  })
  @Exclude({
    toPlainOnly: true,
  })
  role: Role;

  @Column({
    nullable: true,
    unique: true,
  })
  nickname: string;

  @Column({
    type: 'enum',
    enum: LoginType,
    default: LoginType.NORMAL,
  })
  @Exclude({
    toPlainOnly: true,
  })
  type: LoginType;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.user)
  comment: Comment[];

  @OneToMany(() => Community, (community) => community.user)
  community: Community[];

  @OneToMany(() => Review, (review) => review.user)
  review: Review[];
  @OneToMany(() => Chat, (chat) => chat.author)
  chats: Chat[];

  @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.users)
  chatRooms: ChatRoom[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @Column({
    type: 'json',
    nullable: true,
  })
  pushSubscription: PushSubscriptions | null;
}

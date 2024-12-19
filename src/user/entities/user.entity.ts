import { Exclude } from 'class-transformer';
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

  @OneToMany(() => Chat, (chat) => chat.author)
  chats: Chat[];

  @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.users)
  chatRooms: ChatRoom[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];
}

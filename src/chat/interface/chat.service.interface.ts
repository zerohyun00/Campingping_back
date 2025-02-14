import { Socket } from 'socket.io';
import { CreateChatDto } from '../dto/create-chat.dto';
import { QueryRunner } from 'typeorm';
import { ChatRoom } from '../entities/chat-room.entity';
import { User } from 'src/user/entities/user.entity';
import { Chat } from '../entities/chat.entity';
import { ChatResType } from '../type/chat.res.type';
import { ChatHistoryDto } from '../dto/chat-history.dto';

export interface IChatService {
  getClientById(userId: string): Socket | undefined;
  registerClient(userId: string, client: Socket): void;
  removeClient(userId: string): void;
  joinRooms(user: { sub: string }, client: Socket): Promise<ChatRoom[]>;
  createMessage(
    payload: { sub: string },
    { message, room }: CreateChatDto,
    qr: QueryRunner,
  ): Promise<{
    message: string;
    sender: { email: string; nickname: string };
    createdAt: Date;
  }>;
  findOrCreateChatRoom(
    userIds: [string, string],
    qr: QueryRunner,
  ): Promise<ChatRoom>;
  findUserByEmail(email: string): Promise<User>;
  getChatHistory(
    roomId: number,
    cursor?: number,
    limit?: number,
  ): Promise<{ chatHistory: ChatHistoryDto[]; nextCursor?: number }>;
  markMessagesRead(userId: string, roomId: number): Promise<void>;
  getUnreadMessageCount(roomId: number, userId: string): Promise<number>;
  getChatRooms(userId: string): Promise<ChatResType[]>;
  leaveChatRoom(roomId: number, userId: string);
  isUserInRoom(userId: string, roomId: number): Promise<boolean>;
}

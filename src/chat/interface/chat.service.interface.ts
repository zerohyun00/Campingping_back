import { Socket } from "socket.io";
import { CreateChatDto } from "../dto/create-chat.dto";
import { QueryRunner } from "typeorm";
import { ChatRoom } from "../entities/chat-room.entity";
import { User } from "src/user/entities/user.entity";
import { Chat } from "../entities/chat.entity";

export interface IChatService {
    getClientById(userId: string): Socket | undefined;
    registerClient(userId: string, client:Socket): Promise<void>;
    removeClient(userId: string): Promise<void>;
    joinRooms(user: { sub: string }, client: Socket): Promise<ChatRoom[]>;
    createMessage(payload: { sub: string }, { message, room }: CreateChatDto, qr: QueryRunner): Promise<Chat>;
    findOrCreateChatRoom( userIds: [string, string], qr: QueryRunner): Promise<ChatRoom>
    findUserByNickname(nickname: string): Promise<User>;
    getChatHistory(roomId: number, page: number, limit: number): Promise<Chat[]>;
    markMessagesRead(userId: string, roomId: number): Promise<void>;
    getUnreadMessageCount(roomId: number, userId: string): Promise<number>;
}
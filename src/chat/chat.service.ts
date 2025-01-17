import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { ChatRoom } from './entities/chat-room.entity';
import { In, Not, QueryRunner, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './entities/chat.entity';
import { WsException } from '@nestjs/websockets';
import { IChatService } from './interface/chat.service.interface';
import { ChatResType } from './type/chat.res.type';

@Injectable()
export class ChatService implements IChatService {
  private readonly connectedClients = new Map<string, Socket>(); // 특정 사용자의 id값을 넣어주면 사용자가 접속한 소켓을 가져올 수 있음

  getClientById(userId: string): Socket | undefined {
    return this.connectedClients.get(userId);
  }

  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  registerClient(userId: string, client: Socket) {
    this.connectedClients.set(userId, client);
  }

  removeClient(userId: string) {
    this.connectedClients.delete(userId);
  }

  async joinRooms(user: { sub: string }, client: Socket) {
    const chatRooms = await this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .innerJoin('chatRoom.users', 'user', 'user.id = :userId', {
        userId: user.sub,
      })
      .getMany();

    for (let room of chatRooms) {
      client.join(room.id.toString());
      await this.markMessagesRead(user.sub, room.id); // ## 동시에 처리해보자
    }

    return chatRooms; // 방 목록 반환
  }

  async createMessage(
    payload: { sub: string },
    { message, room }: CreateChatDto,
    qr: QueryRunner,
  ) {
    // 사용자 정보를 이메일로 조회
    // ## 동시에 처리해보자: qr.manager.findOne, qr.manager.findOne
    const user = await qr.manager.findOne(User, { where: { id: payload.sub } }).catch((error) => {
      // https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/useonlythebuiltinerror.md
      throw new AppError(commonError.DB_ERROR, 'user를 가져오는 도중 에러 발생', { httpStatusCode: commonErrorStatusCode.INTERNAL_SERVER_ERRROR, cause: error });
    });
    if (!user) {
      throw new WsException('사용자를 찾을 수 없습니다.');
    }

    const chatRoom = await qr.manager.findOne(ChatRoom, {
      where: { id: room },
      relations: ['users'],
    });

    if (!chatRoom) throw new Error('유효하지 않은 채팅방입니다.');

    if (!chatRoom.users.some((u) => u.id === user.id)) {
      throw new WsException('해당 채팅방에 참여하고 있지 않습니다.');
    }

    // 메시지 저장
    const chatMessage = await qr.manager.save(Chat, {
      author: user,
      message,
      chatRoom,
    });

    // 연결된 클라이언트들에게 메시지 전송
    const clients = chatRoom.users.map((user) =>
      this.connectedClients.get(user.id),
    );
    clients.forEach((client) => {
      if (client) {
        client.emit('newMessage', {
          roomId: chatRoom.id,
          message: chatMessage.message,
          sender: {email: user.email, nickname: user.nickname}, // 이메일로 전송
          createdAt: chatMessage.createdAt, // 생성 시간 포함
        });
      }
    });

    return {
      message: chatMessage.message,
      sender: {email: user.email, nickname: user.nickname},
      createdAt: chatMessage.createdAt,
    };
  }

  async findOrCreateChatRoom(
    userIds: [string, string], // 두 명의 유저만 받음
    qr: QueryRunner,
  ): Promise<ChatRoom> {
    // 유저 ID 정렬: 항상 같은 순서로 방을 찾기 위해
    const sortedUserIds = userIds.sort();

    // 유저 존재 여부 확인
    const users = await qr.manager.find(User, {
      where: { id: In(sortedUserIds) },
    });

    if (users.length !== 2) {
      throw new Error('유효하지 않은 사용자 목록입니다.');
    }

    // 기존 방 찾기
    const existingRoom = await qr.manager
      .createQueryBuilder(ChatRoom, 'room')
      .innerJoin('room.users', 'user', 'user.id IN (:...userIds)', {
        userIds: sortedUserIds,
      })
      .groupBy('room.id')
      .having('COUNT(user.id) = :count', { count: 2 })
      .getOne();

    if (existingRoom) {
      console.log(`[INFO] Found existing room: ${existingRoom.id}`);
      return existingRoom;
    }

    // 새 방 생성
    const newRoom = qr.manager.create(ChatRoom, { users });
    const savedRoom = await qr.manager.save(newRoom);

    console.log(`[INFO] Created new room: ${savedRoom.id}`);
    return savedRoom;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    return user;
  }

  async getChatHistory(
    roomId: number,
    page: number,
    limit: number,
  ): Promise<Chat[]> {
    const offset = (page - 1) * limit;

    const chatHistory = await this.chatRepository.find({
      where: { chatRoom: { id: roomId } },
      relations: ['author'],
      order: { createdAt: 'ASC' },
      skip: offset,
      take: limit,
    });

    return chatHistory;
  }

  async markMessagesRead(userId: string, roomId: number): Promise<void> {
    await this.chatRepository
      .createQueryBuilder()
      .update(Chat)
      .set({ isRead: true })
      .where('chatRoom.id = :roomId', { roomId })
      .andWhere('author.id != :userId', { userId }) // 본인이 작성한 메시지는 제외
      .andWhere('isRead = false') // 읽지 않은 메시지만
      .execute();
  }

  async getUnreadMessageCount(roomId: number, userId: string): Promise<number> {
    const unreadCount = await this.chatRepository.count({
      where: {
        chatRoom: { id: roomId },
        isRead: false,
        author: { id: Not(userId) }, // 상대방이 보낸 메시지만 확인
      },
    });

    return unreadCount;
  }

  async getChatRooms(userId: string): Promise<ChatResType[]> {
    // 채팅방 및 유저 정보를 가져오고, 현재 유저를 제외한 나머지 유저를 필터링
    const chatRooms = await this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .innerJoinAndSelect('chatRoom.users', 'user', 'user.id != :userId', {
        userId,
      }) // 현재 유저 제외
      .innerJoinAndSelect('chatRoom.chats', 'chat', 'chat.deletedAt IS NULL') // 채팅 데이터
      .where(
        (qb) =>
          'chatRoom.id IN ' +
          qb
            .subQuery()
            .select('chatRoomUser.chatRoomId')
            .from('chat_room_users_user', 'chatRoomUser')
            .where('chatRoomUser.userId = :userId', { userId })
            .getQuery(),
      ) // 현재 유저가 속한 채팅방만
      .andWhere('chatRoom.deletedAt IS NULL') // 삭제되지 않은 방만
      .orderBy('chat.createdAt', 'DESC') // 최근 메시지 순 정렬
      .getMany();
    const result = chatRooms.map((room) => {
      const lastChat = room.chats.length > 0 ? room.chats[0] : null; // 가장 최근 메시지
      return {
        roomId: room.id,
        createdAt: room.createdAt,
        users: room.users.map((user) => ({
          email: user.email,
          nickname: user.nickname,
        })), // 상대방 유저 정보
        lastMessage: lastChat ? lastChat.message : null,
        lastMessageTime: lastChat ? lastChat.createdAt : null,
        Isread: lastChat.isRead,
      };
    });

    return result;
  }
}

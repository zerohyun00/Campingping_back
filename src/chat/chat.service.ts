import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { ChatRoom } from './entities/chat-room.entity';
import { In, Not, QueryRunner, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './entities/chat.entity';
import { IChatService } from './interface/chat.service.interface';
import { ChatResType } from './type/chat.res.type';
import { AppError } from 'src/common/utils/app-error';
import { CommonError, CommonErrorStatusCode } from 'src/common/utils/app-error';
import { ChatHistoryDto } from './dto/chat-history.dto';
import { WebPushService } from './web-push.service';
@Injectable()
export class ChatService implements IChatService {
  private readonly connectedClients = new Map<string, Socket>(); // 특정 사용자의 id값을 넣어주면 사용자가 접속한 소켓을 가져올 수 있음
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    private readonly webPushService: WebPushService,
  ) {}

  getClientById(userId: string): Socket | undefined {
    return this.connectedClients.get(userId);
  }

  registerClient(userId: string, client: Socket) {
    this.connectedClients.set(userId, client);
  }

  removeClient(userId: string) {
    this.connectedClients.delete(userId);
  }

  /**
   * 사용자가 속한 모든 채팅방에 참여하고, 해당 방의 메시지를 읽음으로 표시합니다.
   * @param user 사용자 정보
   * @param client 소켓 클라이언트
   * @returns 참여한 채팅방 목록
   */
  async joinRooms(user: { sub: string }, client: Socket): Promise<ChatRoom[]> {
    try {
      // 현재 사용자가 참여한 채팅방 조회
      const chatRooms = await this.chatRoomRepository
        .createQueryBuilder('chatRoom')
        .innerJoin('chatRoom.users', 'user', 'user.id = :userId', {
          userId: user.sub,
        })
        .getMany();

      // 참여할 채팅방이 없는 경우
      if (!chatRooms || chatRooms.length === 0) {
        this.logger.warn(`[WARN] User ${user.sub} 참여할 채팅방이 없습니다.`);
        return []; // 빈 배열 반환
      }

      // 채팅방 참여 및 메시지 읽음 처리
      const joinAndMarkPromises = chatRooms.map(async (room) => {
        try {
          client.join(room.id.toString()); // 클라이언트를 해당 방에 추가
          await this.markMessagesRead(user.sub, room.id); // 메시지 읽음 처리
        } catch (error) {
          this.logger.error(
            `Failed to join or mark messages in room ${room.id}`,
            error.stack,
          );
        }
      });

      await Promise.all(joinAndMarkPromises);

      return chatRooms; // 참여한 채팅방 목록 반환
    } catch (error) {
      // DB 에러 처리
      this.logger.error('Error while joining chat rooms', error.stack);
      throw new AppError(
        CommonError.DB_ERROR,
        '채팅방에 참여하는 도중 에러가 발생했습니다.',
        {
          httpStatusCode: CommonErrorStatusCode.INTERNAL_SERVER_ERROR,
          cause: error,
        },
      );
    }
  }

  /**
   * 채팅 메시지를 생성하고, 연결된 클라이언트들에게 메시지를 전송합니다.
   * @param payload 사용자 정보
   * @param dto 메시지 생성 DTO
   * @param qr QueryRunner 인스턴스
   * @returns 생성된 메시지 정보
   */
  async createMessage(
    payload: { sub: string },
    { message, room }: CreateChatDto,
    qr: QueryRunner,
  ): Promise<{
    message: string;
    sender: { email: string; nickname: string };
    createdAt: string;
  }> {
    try {
      const [user, chatRoom] = await Promise.all([
        qr.manager.findOne(User, { where: { id: payload.sub } }),
        qr.manager.findOne(ChatRoom, {
          where: { id: room },
          relations: ['users'],
        }),
      ]);

      if (!user) {
        throw new AppError(
          CommonError.NOT_FOUND,
          '사용자를 찾을 수 없습니다.',
          {
            httpStatusCode: CommonErrorStatusCode.NOT_FOUND,
          },
        );
      }

      if (!chatRoom) {
        throw new AppError(
          CommonError.NOT_FOUND,
          '유효하지 않은 채팅방입니다.',
          {
            httpStatusCode: CommonErrorStatusCode.NOT_FOUND,
          },
        );
      }

      if (!chatRoom.users.some((u) => u.id === user.id)) {
        throw new AppError(
          CommonError.VALIDATION_ERROR,
          '해당 채팅방에 참여하고 있지 않습니다.',
          {
            httpStatusCode: CommonErrorStatusCode.BAD_REQUEST,
          },
        );
      }

      // 메시지 저장
      const chatMessage = await qr.manager.save(Chat, {
        author: user,
        message,
        chatRoom,
      });

      // 웹 푸시 전송
      chatRoom.users.forEach(async (recipient) => {
        if (recipient.id !== user.id) {
          console.log(
            `[DEBUG] ${recipient.nickname}의 pushSubscription:`,
            recipient.pushSubscription,
          );

          if (recipient.pushSubscription) {
            await this.webPushService.sendNotification(
              recipient.pushSubscription,
              {
                title: chatMessage.author.nickname,
                body: message,
                roomId: chatRoom.id,
              },
            );
          } else {
            console.warn(
              `[WARN] ${recipient.nickname}에게 보낼 pushSubscription이 없습니다.`,
            );
          }
        }
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
            sender: { email: user.email, nickname: user.nickname }, // 이메일로 전송
            createdAt: chatMessage.createdAt.toISOString(), // 생성 시간 포함
          });
        }
      });

      return {
        message: chatMessage.message,
        sender: { email: user.email, nickname: user.nickname },
        createdAt: chatMessage.createdAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error; // 이미 AppError인 경우 그대로 던짐
      }
      this.logger.error('메시지 생성 도중 에러 발생', error.stack);
      throw new AppError(
        CommonError.DB_ERROR,
        '메시지를 생성하는 도중 에러가 발생했습니다.',
        {
          httpStatusCode: CommonErrorStatusCode.INTERNAL_SERVER_ERROR,
          cause: error,
        },
      );
    }
  }

  /**
   * 두 사용자 간의 채팅방을 찾거나 생성합니다.
   * @param userIds 두 사용자의 ID
   * @param qr QueryRunner 인스턴스
   * @returns 찾거나 생성된 채팅방
   */
  async findOrCreateChatRoom(
    userIds: [string, string], // 두 명의 유저만 받음
    qr: QueryRunner,
  ): Promise<ChatRoom> {
    try {
      // 유저 ID 정렬: 항상 같은 순서로 방을 찾기 위해
      const sortedUserIds = [...userIds].sort();

      // 유저 존재 여부 확인
      const users = await qr.manager.find(User, {
        where: { id: In(sortedUserIds) },
      });

      if (users.length !== 2) {
        throw new AppError(
          CommonError.VALIDATION_ERROR,
          '유효하지 않은 사용자 목록입니다.',
          {
            httpStatusCode: CommonErrorStatusCode.BAD_REQUEST,
          },
        );
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
        this.logger.log(`[INFO] Found existing room: ${existingRoom.id}`);
        return existingRoom;
      }

      // 새 방 생성
      const newRoom = qr.manager.create(ChatRoom, { users });
      const savedRoom = await qr.manager.save(newRoom);

      this.logger.log(`[INFO] Created new room: ${savedRoom.id}`);
      return savedRoom;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error('채팅방을 찾거나 생성하는 중 에러 발생', error.stack);
      throw new AppError(
        CommonError.DB_ERROR,
        '채팅방을 찾거나 생성하는 중 에러가 발생했습니다.',
        {
          httpStatusCode: CommonErrorStatusCode.INTERNAL_SERVER_ERROR,
          cause: error,
        },
      );
    }
  }

  /**
   * 이메일로 사용자를 조회합니다.
   * @param email 사용자 이메일
   * @returns 사용자 정보 또는 null
   */
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      return user || null;
    } catch (error) {
      this.logger.error('이메일로 사용자 조회 중 에러 발생', error.stack);
      throw new AppError(
        CommonError.DB_ERROR,
        '사용자를 조회하는 도중 에러가 발생했습니다.',
        {
          httpStatusCode: CommonErrorStatusCode.INTERNAL_SERVER_ERROR,
          cause: error,
        },
      );
    }
  }

  /**
   * 특정 채팅방의 채팅 기록을 조회합니다.
   * @param roomId 채팅방 ID
   * @param page 페이지 번호
   * @param limit 페이지 당 항목 수
   * @returns 채팅 기록 목록
   */
  async getChatHistory(
    roomId: number,
    cursor?: number,
    limit: number = 50,
  ): Promise<{ chatHistory: ChatHistoryDto[]; nextCursor?: number }> {
    const query = this.chatRepository
      .createQueryBuilder('chat')
      .innerJoinAndSelect('chat.author', 'author')
      .where('chat.chatRoomId = :roomId', { roomId })
      .orderBy('chat.id', 'DESC')
      .take(limit + 1);

    if (cursor) {
      query.andWhere('chat.id < :cursor', { cursor });
    }

    const chatHistory = await query.getMany();

    let nextCursor: number | undefined = undefined;
    if (chatHistory.length > limit) {
      nextCursor = chatHistory.pop()?.id;
    }

    const chats = chatHistory.reverse();

    // // ✅ 콘솔 로그 추가 (UTC인지 확인)
    // chats.forEach((chat) => {
    //   console.log('📌 원본 createdAt (Date 객체):', chat.createdAt);
    //   console.log('📌 toISOString() 변환 후:', chat.createdAt.toISOString());
    // });

    return {
      chatHistory: chats.map((chat) => ({
        message: chat.message,
        createdAt: chat.createdAt.toISOString(),
        id: chat.id,
        isRead: chat.isRead,
        author: {
          email: chat.author.email,
          nickname: chat.author.nickname,
        },
      })),
      nextCursor,
    };
  }

  /**
   * 특정 채팅방의 메시지를 읽음으로 표시합니다.
   * @param userId 사용자 ID
   * @param roomId 채팅방 ID
   */
  async markMessagesRead(userId: string, roomId: number): Promise<void> {
    try {
      await this.chatRepository
        .createQueryBuilder()
        .update(Chat)
        .set({ isRead: true })
        .where('chatRoom.id = :roomId', { roomId })
        .andWhere('author.id != :userId', { userId }) // 본인이 작성한 메시지는 제외
        .andWhere('isRead = false') // 읽지 않은 메시지만
        .execute();
    } catch (error) {
      this.logger.error(
        `채팅방 ${roomId}의 메시지를 읽음으로 표시하는 중 에러 발생`,
        error.stack,
      );
      throw new AppError(
        CommonError.DB_ERROR,
        `채팅방 ${roomId}의 메시지를 읽음으로 표시하는 중 에러가 발생했습니다.`,
        {
          httpStatusCode: CommonErrorStatusCode.INTERNAL_SERVER_ERROR,
          cause: error,
        },
      );
    }
  }

  /**
   * 특정 채팅방에서 사용자의 읽지 않은 메시지 수를 조회합니다.
   * @param roomId 채팅방 ID
   * @param userId 사용자 ID
   * @returns 읽지 않은 메시지 수
   */
  async getUnreadMessageCount(roomId: number, userId: string): Promise<number> {
    try {
      const unreadCount = await this.chatRepository.count({
        where: {
          chatRoom: { id: roomId },
          isRead: false,
          author: { id: Not(userId) }, // 상대방이 보낸 메시지만 확인
        },
      });

      return unreadCount;
    } catch (error) {
      this.logger.error(
        `채팅방 ${roomId}의 읽지 않은 메시지 수를 조회하는 중 에러 발생`,
        error.stack,
      );
      throw new AppError(
        CommonError.DB_ERROR,
        `채팅방 ${roomId}의 읽지 않은 메시지 수를 조회하는 중 에러가 발생했습니다.`,
        {
          httpStatusCode: CommonErrorStatusCode.INTERNAL_SERVER_ERROR,
          cause: error,
        },
      );
    }
  }

  /**
   * 사용자가 참여한 모든 채팅방의 목록을 조회합니다.
   * @param userId 사용자 ID
   * @returns 채팅방 목록
   */
  async getChatRooms(userId: string): Promise<ChatResType[]> {
    try {
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

      const result = await Promise.all(
        chatRooms.map(async (room) => {
          const lastChat = room.chats.length > 0 ? room.chats[0] : null;
          // unreadCount 조회 (본인이 보낸 메시지는 제외)
          const unreadCount = await this.getUnreadMessageCount(room.id, userId);

          return {
            roomId: room.id,
            createdAt: room.createdAt,
            users: room.users.map((user) => ({
              email: user.email,
              nickname: user.nickname,
            })),
            lastMessage: lastChat ? lastChat.message : null,
            lastMessageTime: lastChat ? lastChat.createdAt : null,
            unreadCount,
          };
        }),
      );

      return result;
    } catch (error) {
      this.logger.error('채팅방 목록 조회 중 에러 발생', error.stack);
      throw new AppError(
        CommonError.DB_ERROR,
        '채팅방 목록을 조회하는 중 에러가 발생했습니다.',
        {
          httpStatusCode: CommonErrorStatusCode.INTERNAL_SERVER_ERROR,
          cause: error,
        },
      );
    }
  }

  async leaveChatRoom(roomId: number, userId: string) {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['users'],
    });

    if (!chatRoom) {
      throw new AppError(CommonError.NOT_FOUND, '채팅방을 찾을 수 없습니다.', {
        httpStatusCode: CommonErrorStatusCode.NOT_FOUND,
      });
    }

    const leavingUser = chatRoom.users.find((u) => u.id === userId);
    if (!leavingUser) {
      throw new AppError(
        CommonError.VALIDATION_ERROR,
        '해당 채팅방에 속해있지 않습니다.',
        {
          httpStatusCode: CommonErrorStatusCode.BAD_REQUEST,
        },
      );
    }

    await Promise.all([
      this.chatRepository.delete({ chatRoom: { id: roomId } }),
      this.chatRoomRepository.delete({ id: roomId }),
    ]);

    chatRoom.users.forEach((user) => {
      if (user.id !== userId) {
        // ✅ 나간 사용자가 아닌 다른 사용자에게만 이벤트 보냄
        const client = this.connectedClients.get(user.id);
        if (client) {
          client.emit('userLeftRoom', {
            roomId,
            email: leavingUser.email,
            message: `유저 ${leavingUser.email} 가 방에서 나갔습니다.`,
          });
        }
      }
    });

    return { message: '채팅방이 삭제되었습니다.' };
  }
}

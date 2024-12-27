import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { ChatRoom } from './entities/chat-room.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './entities/chat.entity';
import { ChatPaginationDto } from './dto/chat-pagination.dto';

@Injectable()
export class ChatService {
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
    }

    return chatRooms; // 방 목록 반환
  }

  async createMessage(
    payload: { sub: string },
    { message, room }: CreateChatDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    // 1. 채팅방 확인
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: room },
      relations: ['users'],
    });

    if (!chatRoom) {
      throw new Error('유효하지 않은 채팅방입니다.');
    }

    // 2. 채팅 메시지 저장
    const chatMessage = await this.chatRepository.save({
      author: user,
      message,
      chatRoom,
    });

    // 3. 메시지 브로드캐스트
    const clients = chatRoom.users.map((user) =>
      this.connectedClients.get(user.id),
    );
    clients.forEach((client) => {
      if (client) {
        client.emit('newMessage', {
          roomId: chatRoom.id,
          message,
          sender: payload.sub,
        });
      }
    });

    return chatMessage;
  }

  async findOrCreateChatRoom(
    userIds: [string, string], // 두 명의 유저만 받음
  ): Promise<ChatRoom> {
    // 유저 ID 정렬: 항상 같은 순서로 방을 찾기 위해
    const sortedUserIds = userIds.sort();

    // 유저 존재 여부 확인
    const users = await this.userRepository.findBy({
      id: In(sortedUserIds),
    });

    if (users.length !== 2) {
      throw new Error('유효하지 않은 사용자 목록입니다.');
    }

    // 기존 방 찾기
    const existingRoom = await this.chatRoomRepository
      .createQueryBuilder('room')
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
    const newRoom = this.chatRoomRepository.create({ users });
    const savedRoom = await this.chatRoomRepository.save(newRoom);

    console.log(`[INFO] Created new room: ${savedRoom.id}`);
    return savedRoom;
  }

  async findUserByNickname(nickname: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { nickname }, // 닉네임으로 조회
    });

    return user || null;
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
}

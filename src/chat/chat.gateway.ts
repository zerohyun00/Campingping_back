import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Inject, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';
import { JwtService } from '@nestjs/jwt';
import { CreateChatDto } from './dto/create-chat.dto';
import { WsTransactionInterceptor } from 'src/common/interceptor/ws-transaction-interceptor';
import { WsQueryRunner } from 'src/common/decorator/ws-query-runner.decorator';
import { QueryRunner } from 'typeorm';
import { IChatService } from './interface/chat.service.interface';
import {
  AppError,
  CommonError,
  CommonErrorStatusCode,
} from 'src/common/utils/app-error';

@WebSocketGateway({
  cors: {
    origin: 'https://campingping.com',
    methods: ['GET', 'POST'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Origin: *',
    ],
    credentials: true,
  },
  namespace: 'chats',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject('IChatService')
    private readonly chatService: IChatService,
    private readonly jwtService: JwtService,
  ) {}

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.chatService.removeClient(user.sub);
      console.log(`[DISCONNECTED] User ${user.sub} has disconnected.`);
    } else {
      console.error(
        '[DISCONNECT ERROR] 인증되지 않은 사용자가 연결을 끊었습니다.',
      );
    }
  }

  async handleConnection(client: Socket) {
    try {
      const rawCookies =
        client.handshake.headers.cookie || client.handshake.headers;
      let token: string | undefined;

      if (typeof rawCookies === 'string') {
        const parsedCookies = cookie.parse(rawCookies);
        token = parsedCookies['accessToken'];
      }

      if (!token) {
        const authHeader = client.handshake.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.slice(7);
        }
      }

      if (!token) {
        throw new UnauthorizedException('토큰이 없습니다.');
      }

      const payload = this.jwtService.verify(token);
      if (!payload) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      client.data.user = payload;
      this.chatService.registerClient(payload.sub, client);
      await this.chatService.joinRooms(payload, client);

      console.log(`[CONNECTED] User ${payload.sub} has connected.`);
    } catch (error) {
      console.error(`[ERROR] Connection failed: ${error.message}`);
      client.disconnect();
    }
  }

  @SubscribeMessage('sendMessage')
  @UseInterceptors(WsTransactionInterceptor)
  async handleMessage(
    @MessageBody() body: CreateChatDto,
    @ConnectedSocket() client: Socket,
    @WsQueryRunner() qr: QueryRunner,
  ) {
    const payload = client.data.user;
    await this.chatService.createMessage(payload, body, qr);
  }

  @SubscribeMessage('createRoom')
  @UseInterceptors(WsTransactionInterceptor)
  async handleCreateRoom(
    @MessageBody() body: { email: string },
    @ConnectedSocket() client: Socket,
    @WsQueryRunner() qr: QueryRunner,
  ) {
    const payload = client.data.user;

    const targetUser = await this.chatService.findUserByEmail(body.email);
    if (!targetUser) {
      throw new AppError(
        CommonError.NOT_FOUND,
        '해당 이메일을 가진 사용자가 존재하지 않습니다.',
        {
          httpStatusCode: CommonErrorStatusCode.NOT_FOUND,
        },
      );
    }

    const chatRoom = await this.chatService.findOrCreateChatRoom(
      [payload.sub, targetUser.id],
      qr,
    );

    client.join(chatRoom.id.toString());
    const otherClient = this.chatService.getClientById(targetUser.id);
    if (otherClient) {
      otherClient.join(chatRoom.id.toString());
    }

    client.emit('roomCreated', {
      roomId: chatRoom.id,
      message: `Room with ID ${chatRoom.id} created successfully.`,
    });

    console.log(`[INFO] Room ${chatRoom.id} created by User ${payload.sub}`);
  }

  @SubscribeMessage('getChatHistory')
  async handleGetChatHistory(
    @MessageBody() body: { roomId: number; cursor?: number; limit?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const limit = body.limit ?? 50;
    const payload = client.data.user;

    const chatRooms = await this.chatService.joinRooms(
      { sub: payload.sub },
      client,
    );
    const isMember = chatRooms.some((room) => room.id === body.roomId);

    if (!isMember) {
      throw new AppError(
        CommonError.FORBIDDEN,
        '해당 채팅방에 속하지 않았습니다.',
        {
          httpStatusCode: CommonErrorStatusCode.FORBIDDEN,
        },
      );
    }

    const chatHistory = await this.chatService.getChatHistory(
      body.roomId,
      body.cursor,
      limit,
    );

    await this.chatService.markMessagesRead(payload.sub, body.roomId);

    client.emit('chatHistory', chatHistory);
  }

  @SubscribeMessage('getChatRooms')
  async handleGetChatRooms(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      const user = client.data.user;
      const chatRooms = await this.chatService.getChatRooms(user.sub);
      client.emit('chatRooms', chatRooms);
    } catch (error) {
      throw new AppError(
        CommonError.DB_ERROR,
        '채팅방 목록을 불러오는 데 실패했습니다.',
        {
          httpStatusCode: CommonErrorStatusCode.INTERNAL_SERVER_ERROR,
          cause: error,
        },
      );
    }
  }

  @SubscribeMessage('openChatRoom')
  async handleOpenChatRoom(
    @MessageBody() body: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const payload = client.data.user;

      await this.chatService.markMessagesRead(payload.sub, body.roomId);

      client.to(body.roomId.toString()).emit('updateRead', {
        roomId: body.roomId,
        email: payload.email,
        isRead: true,
      });

      console.log(
        `[INFO] User ${payload.sub} marked messages as read in Room ${body.roomId}`,
      );
    } catch (error) {
      throw new AppError(
        CommonError.DB_ERROR,
        '메시지 읽음 처리 중 오류가 발생했습니다.',
        {
          httpStatusCode: CommonErrorStatusCode.INTERNAL_SERVER_ERROR,
          cause: error,
        },
      );
    }
  }
}

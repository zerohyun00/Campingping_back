import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import {
  Inject,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';
import { JwtService } from '@nestjs/jwt';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtWsAuthGuard } from './guard/jwtWs.guard';
import { WsTransactionInterceptor } from 'src/common/interceptor/ws-transaction-interceptor';
import { WsQueryRunner } from 'src/common/decorator/ws-query-runner.decorator';
import { QueryRunner } from 'typeorm';
import { IChatService } from './interface/chat.service.interface';
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
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
@WebSocketGateway()
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
    console.log('[DEBUG] Inside handleConnection');

    try {
      const rawCookies =
        client.handshake.headers.cookie || client.handshake.headers;
      let token: string | undefined;

      // 쿠키에서 토큰 가져오기
      if (typeof rawCookies === 'string') {
        const parsedCookies = cookie.parse(rawCookies);
        token = parsedCookies['accessToken'];
      }

      // Authorization 헤더에서 Bearer 토큰 가져오기
      if (!token) {
        const authHeader = client.handshake.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.slice(7, authHeader.length);
        }
      }
      if (!token) {
        throw new UnauthorizedException('토큰이 없습니다.');
      }
      // JWT 검증
      const payload = this.jwtService.verify(token); // `accessToken` 대신 `token` 사용
      if (!payload) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }
      console.log('[DEBUG] Verified User:', payload);

      // 인증된 사용자 정보를 클라이언트 데이터에 저장
      client.data.user = payload;

      // 사용자 ID와 클라이언트를 채팅 서비스에 등록
      this.chatService.registerClient(payload.sub, client);

      console.log(`[CONNECTED] User ${payload.sub} has connected.`);

      // 사용자 채팅방에 참여시키기
      await this.chatService.joinRooms(payload, client);
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
    @MessageBody() body: { email: string }, // 상대방 유저 이메일만 받음
    @ConnectedSocket() client: Socket,
    @WsQueryRunner() qr: QueryRunner,
  ) {
    try {
      const payload = client.data.user;

      // 본인의 정보와 상대방 이메일을 사용해 사용자 조회
      const targetUser = await this.chatService.findUserByEmail(body.email);

      if (!targetUser) {
        throw new WsException('해당 이메일을 가진 사용자가 존재하지 않습니다.');
      }

      // 본인의 ID와 상대방 ID를 사용해 방 생성
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
    } catch (error) {
      console.error(`[ERROR] Failed to create room: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('getChatHistory')
  async handleGetChatHistory(
    @MessageBody() body: { roomId: number; page: number; limit: number }, // page와 limit 추가
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const payload = client.data.user;

      // 사용자가 해당 방에 속해 있는지 확인
      const chatRooms = await this.chatService.joinRooms(
        { sub: payload.sub },
        client,
      );
      const isMember = chatRooms.some((room) => room.id === body.roomId);

      if (!isMember) {
        client.emit('error', { message: '해당 채팅방에 속하지 않았습니다.' });
        return;
      }

      // 채팅 기록 조회
      const chatHistory = await this.chatService.getChatHistory(
        body.roomId,
        body.page,
        body.limit,
      );

      client.emit('chatHistory', chatHistory);
    } catch (error) {
      console.error(`[ERROR] Failed to fetch chat history: ${error.message}`);
      client.emit('error', { message: '채팅 기록을 가져오는데 실패했습니다.' });
    }
  }
}

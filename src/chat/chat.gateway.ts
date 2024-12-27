import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import {
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

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
@UseGuards(JwtWsAuthGuard)
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
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
      const rawCookies = client.handshake.headers.cookie;
      if (!rawCookies) {
        throw new UnauthorizedException('쿠키가 없습니다.');
      }
      const parsedCookies = cookie.parse(rawCookies);
      console.log('[DEBUG] Parsed Cookies:', parsedCookies);

      const accessToken = parsedCookies['accessToken'];
      if (!accessToken) {
        throw new UnauthorizedException('accessToken이 없습니다.');
      }

      const payload = this.jwtService.verify(accessToken);
      if (!payload) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }
      console.log('[DEBUG] Verified User:', payload);

      client.data.user = payload; // 인증된 사용자 데이터를 클라이언트에 저장
      this.chatService.registerClient(payload.sub, client); // 사용자 ID와 클라이언트를 등록

      console.log(`[CONNECTED] User ${payload.sub} has connected.`);

      await this.chatService.joinRooms(payload, client);
    } catch (error) {
      console.error(`[ERROR] Connection failed: ${error.message}`);
      client.disconnect(); // 인증 실패 시 연결 끊기
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
    @MessageBody() body: { nickname: string }, // 상대방 유저 닉네임만 받음
    @ConnectedSocket() client: Socket,
    @WsQueryRunner() qr: QueryRunner,
  ) {
    try {
      const payload = client.data.user;

      // 본인의 정보와 상대방 닉네임을 사용해 사용자 조회
      const targetUser = await this.chatService.findUserByNickname(
        body.nickname,
      );

      if (!targetUser) {
        throw new Error('해당 닉네임을 가진 사용자가 존재하지 않습니다.');
      }

      // 본인의 ID와 상대방 ID를 사용해 방 생성
      const chatRoom = await this.chatService.findOrCreateChatRoom(
        [payload.sub, targetUser.id],
        qr,
      );
      // 본인과 상대방 모두 방에 참여
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

      // 채팅 기록을 클라이언트로 전달
      client.emit('chatHistory', chatHistory);
    } catch (error) {
      console.error(`[ERROR] Failed to fetch chat history: ${error.message}`);
      client.emit('error', { message: '채팅 기록을 가져오는데 실패했습니다.' });
    }
  }
}

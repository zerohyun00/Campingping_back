import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Chat (Mock 데이터 구조만 봐야함!)')
@Controller('chats')
export class ChatMockController {
  @Post('sendMessage')
  @ApiOperation({
    summary: '[Mock] 채팅 메시지 전송',
    description: '특정 채팅방에 메시지를 전송하는 sendMessage 이벤트',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Hello, Mock World!' },
        room: { type: 'number', example: 1 },
      },
      required: ['message'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Mock 메시지가 성공적으로 전송된 응답.',
    schema: {
      example: {
        id: 1,
        message: 'Hello, Mock World!',
        isRead: false,
        createdAt: '2025-01-04T10:00:00.000Z',
        author: {
          id: 'mockUser123',
          nickname: 'MockAlice',
        },
        chatRoom: {
          id: 1,
        },
      },
    },
  })
  sendMessage(@Body() body: { message: string; room?: number }) {
    return {
      id: 1,
      message: body.message,
      isRead: false,
      createdAt: new Date().toISOString(),
      author: {
        id: 'mockUser123',
        nickname: 'MockAlice',
      },
      chatRoom: {
        id: body.room || 1,
      },
    };
  }

  @Post('createRoom')
  @ApiOperation({
    summary: '[Mock] 채팅방 생성',
    description: '특정 상대방과 채팅방을 생성하는 createRoom 이벤트',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@naver.com' },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Mock 채팅방이 성공적으로 생성된 응답.',
    schema: {
      example: {
        roomId: 101,
        message: 'Mock room with ID 101 created successfully.',
      },
    },
  })
  createRoom(@Body() body: { nickname: string }) {
    return {
      roomId: 101,
      message: `Mock room with ID 101 created successfully.`,
    };
  }

  @Post('getChatHistory')
  @ApiOperation({
    summary: '[Mock] 채팅 기록 조회',
    description: '특정 채팅방의 기록을 가져오는 getChatHistory 이벤트',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roomId: { type: 'number', example: 1 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
      },
      required: ['roomId', 'page', 'limit'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Mock 채팅 기록 응답.',
    schema: {
      example: [
        {
          id: 1,
          message: 'Mock Message 1',
          isRead: true,
          createdAt: '2025-01-04T10:00:00.000Z',
          author: {
            id: 'mockUser123',
            nickname: 'MockAlice',
          },
        },
        {
          id: 2,
          message: 'Mock Message 2',
          isRead: false,
          createdAt: '2025-01-04T10:01:00.000Z',
          author: {
            id: 'mockUser456',
            nickname: 'MockBob',
          },
        },
      ],
    },
  })
  getChatHistory(
    @Body() body: { roomId: number; page: number; limit: number },
  ) {
    return [
      {
        id: 1,
        message: 'Mock Message 1',
        isRead: true,
        createdAt: '2025-01-04T10:00:00.000Z',
        author: {
          id: 'mockUser123',
          nickname: 'MockAlice',
        },
      },
      {
        id: 2,
        message: 'Mock Message 2',
        isRead: false,
        createdAt: '2025-01-04T10:01:00.000Z',
        author: {
          id: 'mockUser456',
          nickname: 'MockBob',
        },
      },
    ];
  }
}

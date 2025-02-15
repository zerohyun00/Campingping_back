import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Chat (Mock 데이터 구조만 봐야함!)')
@Controller('chats')
export class ChatMockController {
  /**
   * [Event] 채팅방 생성 요청 (createRoom)
   * - 사용자가 특정 상대방 이메일로 채팅방을 생성하거나 기존 채팅방을 찾습니다.
   */
  @Post('createRoom')
  @ApiOperation({
    summary: '[Event] 채팅방 생성 요청',
    description:
      '사용자가 특정 상대방과 채팅방을 생성합니다. 성공하면 roomCreated 이벤트가 발생합니다.',
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
    description: 'Mock 채팅방이 성공적으로 생성된 응답입니다.',
    schema: {
      example: {
        roomId: 101,
        message: 'Mock room with ID 101 created successfully.',
      },
    },
  })
  createRoom(@Body() body: { email: string }) {
    return {
      roomId: 101,
      message: `Room with ID 101 created successfully.`,
    };
  }

  /**
   * [Event] 채팅방 생성 알림 (roomCreated)
   * - 서버가 채팅방이 생성되었음을 클라이언트에 알립니다.
   */
  @Post('roomCreated')
  @ApiOperation({
    summary: '[Event] 채팅방 생성 알림',
    description:
      '서버가 채팅방 생성 결과를 클라이언트에 전달합니다. 클라이언트는 이를 통해 UI를 업데이트할 수 있습니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roomId: { type: 'number', example: 101 },
        message: { type: 'string', example: 'Room created successfully' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Mock roomCreated 이벤트 응답입니다.',
    schema: {
      example: {
        roomId: 101,
        message: 'Room created successfully',
      },
    },
  })
  emitRoomCreated(@Body() body: { roomId: number; message: string }) {
    return {
      roomId: body.roomId,
      message: body.message,
    };
  }

  /**
   * [Request] 채팅 메시지 전송 요청 (sendMessage)
   * - 사용자가 특정 채팅방에 메시지를 보냅니다. 성공하면 newMessage 이벤트가 발생합니다.
   */
  @Post('sendMessage')
  @ApiOperation({
    summary: '[Event] 채팅 메시지 전송 요청',
    description:
      '사용자가 특정 채팅방에 메시지를 보냅니다. 성공 시 서버에서 newMessage 이벤트를 통해 메시지가 전달됩니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Hello, Mock World!' },
        room: { type: 'number', example: 1 },
      },
      required: ['message', 'room'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Mock 메시지가 성공적으로 전송된 응답입니다.',
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
  sendMessage(@Body() body: { message: string; room: number }) {
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
        id: body.room,
      },
    };
  }

  /**
   * [Event] 새 메시지 알림 (newMessage)
   * - 서버가 새 메시지를 특정 채팅방에 전달합니다.
   */
  @Post('newMessage')
  @ApiOperation({
    summary: '[Event] 새 메시지 알림',
    description:
      '서버가 새 메시지를 채팅방의 모든 클라이언트에 전달합니다. 클라이언트는 이를 통해 채팅 UI를 업데이트합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roomId: { type: 'number', example: 101 },
        message: { type: 'string', example: 'New message content' },
        sender: {
          type: 'object',
          properties: {
            email: { type: 'string', example: 'mockUser123@domain.com' },
            nickname: { type: 'string', example: 'MockAlice' },
          },
        },
        createdAt: { type: 'string', example: '2025-01-04T10:10:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Mock newMessage 이벤트 응답입니다.',
    schema: {
      example: {
        roomId: 101,
        message: 'New message content',
        sender: {
          email: 'mockUser123@domain.com',
          nickname: 'MockAlice',
        },
        createdAt: '2025-01-04T10:10:00.000Z',
      },
    },
  })
  emitNewMessage(
    @Body()
    body: {
      roomId: number;
      message: string;
      sender: { email: string; nickname: string };
      createdAt: string;
    },
  ) {
    return {
      roomId: body.roomId,
      message: body.message,
      sender: body.sender,
      createdAt: body.createdAt,
    };
  }

  /**
   * [Request] 채팅 기록 요청 (getChatHistory)
   * - 사용자가 특정 채팅방의 이전 메시지 기록을 요청합니다.
   */
  @Post('getChatHistory')
  @ApiOperation({
    summary: '[Event] 채팅 기록 요청',
    description:
      '사용자가 특정 채팅방의 이전 메시지 기록을 요청합니다. 성공하면 chatHistory 이벤트가 발생합니다.',
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
    description: 'Mock 채팅 기록 응답입니다.',
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

  /**
   * [Event] 채팅 기록 응답 (chatHistory)
   * - 서버가 채팅방의 이전 메시지 기록을 클라이언트에 전달합니다.
   */
  @Post('chatHistory')
  @ApiOperation({
    summary: '[Event] 채팅 기록 응답',
    description:
      '서버가 요청된 채팅방의 메시지 기록을 클라이언트에 전달합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roomId: { type: 'number', example: 101 },
        history: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Chat message content' },
              createdAt: {
                type: 'string',
                example: '2025-01-04T10:00:00.000Z',
              },
              sender: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'mockUser123@domain.com' },
                  nickname: { type: 'string', example: 'MockAlice' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Mock chatHistory 이벤트 응답입니다.',
    schema: {
      example: {
        roomId: 101,
        history: [
          {
            message: 'Chat message content',
            createdAt: '2025-01-04T10:00:00.000Z',
            sender: {
              email: 'mockUser123@domain.com',
              nickname: 'MockAlice',
            },
          },
        ],
      },
    },
  })
  emitChatHistory(@Body() body: { roomId: number; history: any[] }) {
    return {
      roomId: body.roomId,
      history: body.history,
    };
  }
}

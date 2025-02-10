import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Chat (Mock 데이터 구조만 봐야함!)')
@Controller('chats')
export class ChatMockController {
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
        message: 'Room with ID 101 created successfully.',
      },
    },
  })
  createRoom(@Body() body: { email: string }) {
    return {
      roomId: 101,
      message: `Room with ID 101 created successfully.`,
    };
  }

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
      required: ['roomId', 'message'],
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
        author: { id: 'mockUser123', nickname: 'MockAlice' },
        chatRoom: { id: 1 },
      },
    },
  })
  sendMessage(@Body() body: { message: string; room: number }) {
    return {
      id: 1,
      message: body.message,
      isRead: false,
      createdAt: new Date().toISOString(),
      author: { id: 'mockUser123', nickname: 'MockAlice' },
      chatRoom: { id: body.room },
    };
  }

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
      required: ['roomId', 'message', 'sender', 'createdAt'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Mock newMessage 이벤트 응답입니다.',
    schema: {
      example: {
        roomId: 101,
        message: 'New message content',
        sender: { email: 'mockUser123@domain.com', nickname: 'MockAlice' },
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

  @Post('getChatHistory')
  @ApiOperation({
    summary: '[Event] 채팅 기록 요청',
    description:
      '사용자가 특정 채팅방의 이전 메시지 기록을 요청합니다. 성공 시 chatHistory 와 updateRead 이벤트가 발생합니다.\n\n' +
      '✔ 최신 메시지를 불러오려면 `cursor` 없이 요청합니다.\n' +
      '✔ 스크롤을 올려 이전 메시지를 불러오려면, `nextCursor` 값을 `cursor`로 포함해서 요청합니다.\n' +
      '✔ 응답에 `nextCursor`가 존재하면, 해당 값을 `cursor`로 사용하여 다음 메시지를 요청할 수 있습니다.\n\n' +
      '✅ 프론트 요청 예시:\n' +
      '1️⃣ 최신 메시지 가져오기 (처음 요청 시)\n' +
      '```json\n' +
      '{ "roomId": 1 }\n' +
      '```\n' +
      '2️⃣ 이전 메시지 가져오기 (스크롤 올릴 때)\n' +
      '```json\n' +
      '{ "roomId": 1, "cursor": 45 }\n' +
      '```\n',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roomId: { type: 'number', example: 1, description: '채팅방 ID' },
        cursor: {
          type: 'number',
          example: 45,
          nullable: true,
          description:
            '이전 메시지를 불러올 때 사용하는 메시지 ID (없으면 최신 메시지 조회)',
        },
      },
      required: ['roomId'],
    },
  })
  @ApiResponse({
    status: 200,
    description:
      '채팅 기록 응답입니다. `chatHistory`와 `updateRead` 포함.\n' +
      '✔ `nextCursor` 값이 있으면, 해당 값을 `cursor`로 사용하여 추가 메시지를 요청할 수 있습니다.\n' +
      '✔ `nextCursor`가 없으면, 더 이상 불러올 메시지가 없습니다.\n\n' +
      '✅ 응답 예시:',
    schema: {
      example: {
        chatHistory: [
          {
            id: 50, // 메시지 ID
            message: '답장햇자나',
            createdAt: '2025-02-06T12:11:54.114Z',
            isRead: true,
            author: {
              email: 'test@gmail.com',
              nickname: 'test1',
            },
          },
          {
            id: 49,
            message: '룸테스트 답장',
            createdAt: '2025-02-06T12:11:05.388Z',
            isRead: true,
            author: {
              email: 'test4@gmail.com',
              nickname: 'test5',
            },
          },
        ],
        nextCursor: 48, // ✅ 다음 요청 시 사용할 메시지 ID (이전 메시지 불러올 때 사용)
        updateRead: {
          roomId: 10,
          email: 'test4@gmail.com',
          isRead: true,
        },
      },
    },
  })
  getChatHistory(
    @Body() body: { roomId: number; cursor?: number; limit?: number },
  ) {
    return {
      chatHistory: [
        {
          id: 50,
          message: '답장햇자나',
          createdAt: '2025-02-06T12:11:54.114Z',
          isRead: true,
          author: { email: 'test@gmail.com', nickname: 'test1' },
        },
        {
          id: 49,
          message: '룸테스트 답장',
          createdAt: '2025-02-06T12:11:05.388Z',
          isRead: true,
          author: { email: 'test4@gmail.com', nickname: 'test5' },
        },
        {
          id: 48,
          message: 'hi',
          createdAt: '2025-02-06T12:10:28.684Z',
          isRead: true,
          author: { email: 'test@gmail.com', nickname: 'test1' },
        },
        {
          id: 47,
          message: '룸테스트 답장',
          createdAt: '2025-02-06T12:07:35.244Z',
          isRead: true,
          author: { email: 'test@gmail.com', nickname: 'test1' },
        },
        {
          id: 46,
          message: '룸테스트',
          createdAt: '2025-02-06T12:06:40.200Z',
          isRead: true,
          author: { email: 'test4@gmail.com', nickname: 'test5' },
        },
      ],
      nextCursor: 45, // ✅ 다음 요청 시 이 값을 cursor로 사용
      updateRead: {
        roomId: body.roomId,
        email: 'test4@gmail.com', // 현재 요청한 사용자의 이메일 (Mock 데이터)
        isRead: true, // 모든 메시지가 읽음 처리됨
      },
    };
  }

  @Post('getChatRooms')
  @ApiOperation({
    summary: '[Event] 채팅방 목록 조회 요청',
    description:
      '사용자가 참여 중인 모든 채팅방의 목록을 조회합니다. 성공시 chatRooms 이벤트가 발생합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '채팅방 목록 조회 성공',
    schema: {
      example: [
        {
          roomId: 1,
          createdAt: '2025-01-01T10:00:00.000Z',
          users: [{ email: 'test@example.com', nickname: 'TestUser' }],
          lastMessage: '안녕하세요',
          lastMessageTime: '2025-01-01T10:05:00.000Z',
          unreadCount: 2,
        },
      ],
    },
  })
  getChatRooms(@Body() body: { userId: string }) {
    return [
      {
        roomId: 1,
        createdAt: new Date('2025-01-01T10:00:00.000Z').toISOString(),
        users: [{ email: 'test@example.com', nickname: 'TestUser' }],
        lastMessage: '안녕하세요',
        lastMessageTime: new Date('2025-01-01T10:05:00.000Z').toISOString(),
        unreadCount: 2,
      },
    ];
  }
}

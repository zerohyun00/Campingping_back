import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { IChatService } from './interface/chat.service.interface';

@ApiTags('Chats (채팅 관련 API)')
@Controller('chats')
export class ChatController {
  constructor(
    @Inject('IChatService') private readonly chatService: IChatService,
  ) {}

  /**
   * @description 현재 로그인한 사용자가 참여 중인 채팅방 목록을 조회하는 API
   * @returns 사용자의 채팅방 목록 배열
   */
  @Get('rooms')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '채팅방 목록 조회',
    description:
      '로그인한 사용자가 속한 채팅방 목록을 반환합니다. (채팅방 ID, 유저 목록, 마지막 메시지 포함)',
  })
  @ApiBearerAuth() // JWT 인증 필요
  @ApiResponse({
    status: 200,
    description: '채팅방 목록 조회 성공',
    schema: {
      example: {
        statusCode: 200,
        data: [
          {
            roomId: 9,
            createdAt: '2024-12-27T08:33:39.907Z',
            users: [
              {
                email: 'test@gmail.com',
                nickname: 'test1',
              },
            ],
            lastMessage: '읽씹테스트',
            lastMessageTime: '2025-01-07T08:25:52.512Z',
            isRead: false,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'JWT 토큰이 없거나 유효하지 않은 경우',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async getChatRooms(@Req() req): Promise<any[]> {
    const userId = req.user.sub;
    return await this.chatService.getChatRooms(userId);
  }

  /**
   * @description 사용자가 특정 채팅방을 나가고, 해당 채팅방을 삭제하는 API (1:1 채팅방)
   * @param roomId 나갈 채팅방의 ID
   * @returns 채팅방 삭제 성공 메시지
   */
  @Delete('rooms/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '채팅방 나가기 (채팅방 삭제)',
    description:
      '로그인한 사용자가 특정 채팅방을 나갑니다. (1:1 채팅방 특성 상 한 명이라도 나가면 채팅기록 , 채팅방 자동삭제)',
  })
  @ApiBearerAuth() // JWT 인증 필요
  @ApiParam({
    name: 'roomId',
    required: true,
    description: '나갈 채팅방의 ID',
    example: 9,
  })
  @ApiResponse({
    status: 200,
    description: '채팅방 삭제 성공',
    schema: {
      example: {
        statusCode: 200,
        message: '채팅방이 삭제되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '사용자가 해당 채팅방에 속해있지 않거나 유효하지 않은 요청',
    schema: {
      example: {
        statusCode: 400,
        errorType: 'VALIDATION_ERROR',
        message: '해당 채팅방에 속해있지 않습니다.',
        timestamp: '2025-01-31T02:59:48.845Z',
        path: '/api/chats/rooms/8',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 채팅방일 경우',
    schema: {
      example: {
        statusCode: 404,
        message: '채팅방을 찾을 수 없습니다.',
        error: 'Not Found',
      },
    },
  })
  async leaveChatRoom(@Req() req, @Param('roomId') roomId: number) {
    const userId = req.user.sub;
    return await this.chatService.leaveChatRoom(roomId, userId);
  }
}

import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { IChatService } from './interface/chat.service.interface';

@ApiTags('Chats')
@Controller('chats')
export class ChatController {
  constructor(
    @Inject('IChatService') private readonly chatService: IChatService,
  ) {}

  @Get('rooms')
  @UseGuards(JwtAuthGuard) // 인증이 필요한 엔드포인트
  @ApiOperation({
    summary: '채팅방 목록 조회',
    description: '로그인한 사용자가 속한 채팅방 목록을 반환합니다.',
  })
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
  async getChatRooms(@Req() req): Promise<any[]> {
    const userId = req.user.sub;
    return await this.chatService.getChatRooms(userId);
  }
}

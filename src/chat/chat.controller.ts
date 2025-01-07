import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
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
  async getChatRooms(@Req() req): Promise<any[]> {
    const userId = req.user.sub;
    return await this.chatService.getChatRooms(userId);
  }
}

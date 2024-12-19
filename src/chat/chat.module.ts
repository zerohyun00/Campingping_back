import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { Chat } from './entities/chat.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User, Chat, ChatRoom])],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}

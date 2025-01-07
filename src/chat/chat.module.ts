import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { Chat } from './entities/chat.entity';
import { User } from 'src/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatMockController } from './chat.mock.controller';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([User, Chat, ChatRoom]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  providers: [
    {
      provide: 'IChatService',
      useClass: ChatService,
    },
    ChatGateway,
  ],
  controllers: [ChatMockController, ChatController],
})
export class ChatModule {}

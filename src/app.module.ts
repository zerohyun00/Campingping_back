import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import * as ioRedisStore from 'cache-manager-ioredis';
import { MyConfigModule } from './config/config.module';
import { MyConfigService } from './config/db';
import { CamppingModule } from './campping/campping.module';
import * as dotenv from 'dotenv';
import { UserModule } from './user/user.module';
import { ImageModule } from './image/image.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { ReviewModule } from './review/review.module';
import { CommunityModule } from './community/community.module';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [MyConfigModule],
      useClass: MyConfigService,
      inject: [MyConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: ioRedisStore,
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        ttl: 300,
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    CamppingModule,
    ImageModule,
    CommentModule,
    ReviewModule,
    CommunityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

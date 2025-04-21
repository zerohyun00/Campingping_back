import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import * as ioRedisStore from 'cache-manager-ioredis';
import { MyConfigModule } from './config/config.module';
import { MyConfigService } from './config/db';
import { CampingModule } from './camping/camping.module';
import * as dotenv from 'dotenv';
import { UserModule } from './user/user.module';
import { ImageModule } from './image/image.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { ReviewModule } from './review/review.module';
import { CommunityModule } from './community/community.module';
import { ChatModule } from './chat/chat.module';
import { FavoriteModule } from './favorite/favorite.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogInterceptor } from './common/interceptor/log-interceptor';
import { TransformInterceptor } from './common/interceptor/transformation.intersepter';
import { MetricsModule } from './metrics/metrics.module';
import { MetricsInterceptor } from './metrics/interseptor/metrics.interceptor';
import { MetricsService } from './metrics/metrics.service';
import * as Joi from 'joi';
import { WebhookInterceptor } from './common/interceptor/webhook-interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.number().required(),
        DB_DATABASE: Joi.string().required(),
        HASH_ROUNDS: Joi.number().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        ENV_GMAIL_ADDRESS_KEY: Joi.string().email().required(),
        ENV_GMAIL_PASSWORD_KEY: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        ENV: Joi.string().valid('dev', 'prod').required(),
        KAKAO_CLIENT_ID: Joi.string().required(),
        KAKAO_CLIENT_SECRET: Joi.string().required(),
        KAKAO_CALLBACK_URL: Joi.string().uri().required(),
        AWS_ACCESS_KEY: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_S3_BUCKET: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        VAPID_PUBLIC_KEY: Joi.string().required(),
        VAPID_PRIVATE_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [MyConfigModule],
      useClass: MyConfigService,
      inject: [MyConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);
        return {
          store: ioRedisStore,
          host: redisHost,
          port: redisPort,
          ttl: 300,
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    CampingModule,
    ImageModule,
    CommentModule,
    ReviewModule,
    CommunityModule,
    ChatModule,
    FavoriteModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: WebhookInterceptor,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CommonModule } from 'src/common/common.module';
import { ImageModule } from 'src/image/image.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ImageService } from 'src/image/image.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CommonModule,
    ImageModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
      }),
    }),
  ],

  controllers: [UserController],
  providers: [UserService, ImageService],
  exports: [TypeOrmModule],
})
export class UserModule {}

import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from 'src/image/image.service';
import { AuthenticatedRequest, JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PushSubscriptions } from './entities/user.entity';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly imageService: ImageService,
  ) {}
  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '프로필 이미지 생성',
    description: '로그인 한 사용자 프로필 이미지 추가',
  })
  @ApiResponse({ status: 201, description: '이미지 추가.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '이미지 업로드',
        },
      },
      example: {
        file: 'test.jpg',
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.sub;
    return await this.imageService.updateUserProfileImage(userId, file);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '프로필 이미지 조회',
    description: '로그인 한 사용자 프로필 조회',
  })
  @ApiResponse({ status: 200, description: '프로필 조회' })
  async getUserProfileImages(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return await this.userService.getUserProfileImages(userId);
  }

  @Post('subscribe')
  @ApiOperation({
    summary: '웹 푸시 구독 정보 저장',
    description:
      '✅ 이 API는 **사용자의 푸시 구독 정보를 서버에 저장하는 API입니다.** \n\n' +
      '⚠️ *푸시 알림을 받으려면 반드시 이 API를 호출하여 서버에 구독 정보를 저장해야 합니다.* \n\n' +
      'subscription 객체를 바디에 담아서 보내주시면 됩니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        endpoint: {
          type: 'string',
          example: 'https://fcm.googleapis.com/fcm/send/fJhkl...9UQ:APA91b...',
          description:
            '📌 브라우저가 발급한 고유한 푸시 엔드포인트 URL (VAPID 기반)',
        },
        expirationTime: {
          type: 'number',
          nullable: true,
          example: null,
          description: '📌 구독 만료 시간 (없을 수도 있음, 대부분 null)',
        },
        keys: {
          type: 'object',
          properties: {
            p256dh: {
              type: 'string',
              example: 'BAs6Uehm9Y...',
              description: '📌 푸시 암호화 키 (서버와 클라이언트 간 보안 유지)',
            },
            auth: {
              type: 'string',
              example: 'FvCqD8...',
              description: '📌 인증 키 (푸시 요청을 보호하는 역할)',
            },
          },
          description:
            '📌 푸시 구독 인증 키 (서버에서 푸시 알림을 보낼 때 필요)',
        },
      },
      required: ['endpoint', 'keys'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '✅ 푸시 구독 정보 저장 완료',
    schema: {
      example: {
        message: '푸시 구독 정보가 저장되었습니다.',
      },
    },
  })
  async savePushSubscription(
    @Body() subscription: PushSubscriptions,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.userService.savePushSubscription(subscription, userId);
  }
}

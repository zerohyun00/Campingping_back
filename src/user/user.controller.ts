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
    summary: '푸시 구독 정보 저장',
    description: '사용자의 푸시 구독 정보를 저장합니다.',
  })
  @ApiResponse({ status: 201, description: '푸시 구독 정보 저장 완료.' })
  async savePushSubscription(
    @Body() subscription: PushSubscriptions,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.userService.savePushSubscription(subscription, userId);
  }
}

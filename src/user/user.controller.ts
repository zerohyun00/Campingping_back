import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from 'src/image/image.service';
import { AuthenticatedRequest, JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly imageService: ImageService,
  ) {}
  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '프로필 이미지 생성', description: '로그인 한 사용자 프로필 이미지 추가' })
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
  @ApiOperation({ summary: '프로필 이미지 조회', description: '로그인 한 사용자 프로필 조회' })
  @ApiResponse({ status: 200, description: '프로필 조회' })
  async getUserProfileImages(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return await this.userService.getUserProfileImages(userId);
  }
}

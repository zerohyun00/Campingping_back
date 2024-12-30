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

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly imageService: ImageService,
  ) {}
  @Post('profile')
  @UseGuards(JwtAuthGuard)
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
  async getUserProfileImages(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return await this.userService.getUserProfileImages(userId);
  }
}

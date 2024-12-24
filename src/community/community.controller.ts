import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { AuthenticatedRequest, JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('communities')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Body() createCommunityDto: CreateCommunityDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.communityService.createPost(createCommunityDto, userId);
  }

  @Get()
  findAll() {
    return this.communityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.communityService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param('id') id: number,
    @Body() updateCommunityDto: UpdateCommunityDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.communityService.updatePost(id, updateCommunityDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('id') id: number, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.communityService.deletePost(id, userId);
  }
}

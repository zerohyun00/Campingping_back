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
  Query,
  Inject,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { AuthenticatedRequest, JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ICommunityService } from './interface/community.service.interface';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('communities')
@Controller('communities')
export class CommunityController {
  constructor(
    @Inject('ICommunityService')
    private readonly communityService: ICommunityService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: '새 커뮤니티 게시글 작성', 
    description: '로그인한 사용자의 게시글 작성',
  })
  @ApiBody({ type: CreateCommunityDto })
  @ApiResponse({ 
    status: 201, description: '게시글이 성공적으로 생성되었습니다.' 
  })
  async createPost(
    @Body() createCommunityDto: CreateCommunityDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.communityService.createPost(createCommunityDto, userId);
  }

  @Get()
  @ApiOperation({ summary: '모든 커뮤니티 게시글 조회' })
  @ApiQuery({
    name: 'lon',
    description: '경도 값',
    example: 126.9780,
    required: true,
  })
  @ApiQuery({
    name: 'lat',
    description: '위도 값',
    example: 37.5665,
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    description: '보여줄 게시글 수',
    example: 10,
    required: true,
  })
  @ApiQuery({
    name: 'cursor',
    description: '커서 기반 검색용',
    example: 10,
    required: false,
  })
  @ApiResponse({ status: 200, description: '게시글 목록을 성공적으로 조회했습니다.' })
  findAll(
    @Query('lon') lon: number,
    @Query('lat') lat: number,
    @Query('limit') limit: number,
    @Query('cursor') cursor: number,
    ) {
    return this.communityService.findAll(lon, lat, limit, cursor);
  }
  @Get('myposts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '내 커뮤니티 게시글 조회' })
  @ApiQuery({
    name: 'limit',
    description: '보여줄 게시글 수',
    example: 10,
    required: true,
  })
  @ApiQuery({
    name: 'cursor',
    description: '커서 기반 검색용',
    example: 10,
    required: false,
  })
  @ApiResponse({ status: 200, description: '게시글을 성공적으로 조회했습니다.' })
  async getMyPost(
    @Query('limit') limit: number,
    @Query('cursor') cursor: number,
    @Req() req: AuthenticatedRequest
  ){
    const userId = req.user.sub;
    return this.communityService.getMyPost(limit, cursor, userId);
  }
  @Get(':id')
  @ApiOperation({ summary: '특정 커뮤니티 게시글 조회' })
  @ApiParam({ 
    name: 'id', 
    description: '게시글 ID',
    example: 1,
  })
  @ApiResponse({ status: 200, description: '게시글을 성공적으로 조회했습니다.' })
  findOne(@Param('id') id: number) {
    return this.communityService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: '커뮤니티 게시글 수정',
    description: '로그인한 사용자의 게시글 수정', 
  })
  @ApiParam({ 
    name: 'id', 
    description: '게시글 ID',
    example: 1,
  })
  @ApiBody({ type: UpdateCommunityDto })
  @ApiResponse({ status: 200, description: '게시글이 성공적으로 수정되었습니다.' })
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
  @ApiOperation({ 
    summary: '커뮤니티 게시글 삭제',
    description: '로그인한 사용자의 게시글 삭제',
  })
  @ApiParam({ 
    name: 'id', 
    description: '게시글 ID', 
    example: 1,
  })
  @ApiResponse({ status: 200, description: '게시글이 성공적으로 삭제되었습니다.' })
  async deletePost(@Param('id') id: number, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.communityService.deletePost(id, userId);
  }
}

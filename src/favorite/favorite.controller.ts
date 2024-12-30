import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { FavoriteService } from './favorite.service';
import { AuthenticatedRequest } from 'src/auth/guard/jwt.guard';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';  // Swagger 데코레이터 추가
import { IFavoriteService } from './interface/favorite.service.interface';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiTags('Favorites')
export class FavoriteController {
  constructor(
    @Inject('IFavoriteService')
    private readonly favoriteService: IFavoriteService
  ) {}

  @Get()
  @ApiOperation({
    summary: '사용자의 즐겨찾기 목록 조회',
    description: '로그인한 사용자의 즐겨찾기 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '즐겨찾기 목록 조회 성공',
  })
  async getFavorites(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.favoriteService.getUserFavorites(userId);
  }

  @Post()
  @ApiOperation({
    summary: '즐겨찾기 추가',
    description: '로그인한 사용자의 즐겨찾기 목록을 조회합니다.',
  })
  @ApiBody({
    description: '즐겨찾기 추가를 위한 데이터',
    type: CreateFavoriteDto,
  })
  @ApiResponse({
    status: 201,
    description: '즐겨찾기 추가 성공',
  })
  async createFavorite(
    @Req() req: AuthenticatedRequest,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ) {
    const userId = req.user.sub;
    return this.favoriteService.createFavorite(userId, createFavoriteDto);
  }
}
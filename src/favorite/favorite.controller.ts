import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { FavoriteService } from './favorite.service';
import { AuthenticatedRequest } from 'src/auth/guard/jwt.guard';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  async getFavorites(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.favoriteService.getUserFavorites(userId);
  }

  @Post()
  async createFavorite(
    @Req() req: AuthenticatedRequest,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ) {
    const userId = req.user.sub;
    return this.favoriteService.createFavorite(userId, createFavoriteDto);
  }
}

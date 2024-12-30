import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { FindReviewParam, ParamReview } from './dto/param-review.dto';
import { updateReviewDto } from './dto/update-review.dto';
import { IReviewService } from './interface/review.service.interface';

@Controller('reviews')
export class ReviewController {
  constructor(
    @Inject('IReviewService')
    private readonly reviewSerivce: IReviewService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const userId = req.user.sub;
    await this.reviewSerivce.createReview(createReviewDto, userId);
    return { message: '생성 완료' };
  }
  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Param() paramReview: ParamReview,
    @Req() req: AuthenticatedRequest,
    @Body() updateReviewDto: updateReviewDto,
  ) {
    const userId = req.user.sub;
    const result = await this.reviewSerivce.updateReview(
      paramReview,
      updateReviewDto,
      userId,
    );
    return { message: '수정 완료', data: result };
  }
  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @Param() paramReview: ParamReview,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    await this.reviewSerivce.deleteReview(paramReview, userId);
    return { message: '삭제 완료' };
  }
  @Get('/lists/:contentId')
  async getCampingReview(@Param() findReviewParam: FindReviewParam) {
    const result = await this.reviewSerivce.getReview(findReviewParam);
    return { message: '조회 완료', data: result };
  }
}

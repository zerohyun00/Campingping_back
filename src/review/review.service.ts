import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CampingService } from 'src/camping/camping.service';
import { UserService } from 'src/user/user.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { FindReviewParam, ParamReview } from './dto/param-review.dto';
import { ReponseReviewDto } from './dto/response-review.dto';
import { updateReviewDto } from './dto/update-review.dto';
import { ReviewRepository } from './repository/review.repository';
import { IReviewService } from './interface/review.service.interface';

@Injectable()
export class ReviewService implements IReviewService{
  constructor(
    private campingService: CampingService,
    private reviewRepository: ReviewRepository,
    private userService: UserService,
  ) {}

  async createReview(createReviewDto: CreateReviewDto, userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('로그인이 필요한 서비스 입니다.');

    const camping = await this.campingService.getOne(createReviewDto);
    if (!camping) throw new NotFoundException('조회할 캠핑장이 없습니다.');

    const result = await this.reviewRepository.createReview(
      createReviewDto,
      user,
    );
    return;
  }
  async getReview(findReviewParam: FindReviewParam) {
    const camping = await this.campingService.getOne(findReviewParam);
    if (!camping) throw new NotFoundException('조회할 캠핑장이 없습니다.');

    const result = await this.reviewRepository.getReview(
      findReviewParam.contentId,
    );
    if (!result) throw new NotFoundException('리뷰가 존재하지않습니다.');

    return ReponseReviewDto.allList(result);
  }
  async updateReview(
    paramReview: ParamReview,
    updateReviewDto: updateReviewDto,
    userId: string,
  ) {
    const result = await this.reviewRepository.updateReview(
      paramReview.id,
      userId,
      updateReviewDto,
    );
    if (result.affected === 0)
      throw new BadRequestException(
        '존재하지 않거나 해당 사용자가 작성한 리뷰가 아닙니다.',
      );

    return;
  }
  async deleteReview(paramReview: ParamReview, userId: string) {
    const result = await this.reviewRepository.deleteReview(
      paramReview.id,
      userId,
    );
    if (result.affected === 0)
      throw new BadRequestException(
        '리뷰가 존재하지 않거나 삭제할 권한이 없습니다.',
      );

    return;
  }
}

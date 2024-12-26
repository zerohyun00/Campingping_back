import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewRepository } from "./repository/review.repository";
import { UserService } from "src/user/user.service";
import { FindReviewParam, ParamReview } from "./dto/param-review.dto";
import { updateReviewDto } from "./dto/update-review.dto";
import { ReponseReviewDto } from "./dto/response-review.dto";
import { CampingService } from "src/camping/camping.service";


@Injectable()
export class ReviewService {
    constructor(
        private reviewRepository: ReviewRepository,
        private userService: UserService,
        private campingService: CampingService,
    ){}
    
    async createReview(createReviewDto: CreateReviewDto, userId: string) {
        const user = await this.userService.findOne(userId);
        if(!user) throw new NotFoundException('로그인이 필요한 서비스 입니다.');

        const camping = await this.campingService.findOne(createReviewDto);
        if(!camping) throw new NotFoundException('조회할 캠핑장이 없습니다.');

        const result = await this.reviewRepository.createReview(createReviewDto, user);
        return result;
    }
    async getReview(findReviewParam: FindReviewParam){
        const camping = await this.campingService.findOne(findReviewParam);
        if(!camping) throw new NotFoundException('조회할 캠핑장이 없습니다.');

        const result = await this.reviewRepository.getReview(findReviewParam.contentId);
        if(!result) throw new NotFoundException('리뷰가 존재하지않습니다.');

        return ReponseReviewDto.allList(result);
    }
    async updateReview(paramReview: ParamReview, updateReviewDto: updateReviewDto, userId: string) {
      
        const result = await this.reviewRepository.updateReview(paramReview.id, userId, updateReviewDto);

        // 영향받은 행 수가 0이면 예외 처리
        if (result.affected === 0) {
          throw new BadRequestException('존재하지 않거나 해당 사용자가 작성한 리뷰가 아닙니다.');
        }
        return {messsage: "리뷰 수정완료"}
    }
    async deleteReview(paramReview: ParamReview, userId: string) {
        const result = await this.reviewRepository.deleteReview(paramReview.id, userId);
        if (result.affected === 0) throw new NotFoundException('리뷰가 존재하지 않거나 삭제할 권한이 없습니다.');
        return;
    }
}
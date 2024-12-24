import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewRepository } from "./repository/review.repository";
import { UserService } from "src/user/user.service";
import { FindReviewParam, ParamReview } from "./dto/param-review.dto";
import { updateReviewDto } from "./dto/update-review.dto";
import { ReponseReviewDto } from "./dto/response-review.dto";
import { CamppingService } from "src/campping/campping.service";


@Injectable()
export class ReviewService {
    constructor(
        private reviewRepository: ReviewRepository,
        private userService: UserService,
        private campingService: CamppingService,
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
        const user = await this.userService.findOne(userId);
        if(!user) throw new BadRequestException('로그인이 필요한 서비스 입니다.');
      
        const review = await this.reviewRepository.findOne(paramReview.id);
        if(!review) throw new NotFoundException('리뷰가 존재하지않습니다.');
        if(review.user.id !== userId) throw new UnauthorizedException('수정할 권한이 없습니다');

        Object.assign(review, updateReviewDto);
        const result = await this.reviewRepository.updateReview(review);

        return new ReponseReviewDto(result);
    }
    async deleteReview(paramReview: ParamReview, userId: string) {
        const user = await this.userService.findOne(userId);
        if(!user) throw new BadRequestException('로그인이 필요한 서비스 입니다.');

        const review = await this.reviewRepository.findOne(paramReview.id);
        if(!review) throw new NotFoundException('리뷰가 존재하지 않습니다.');
        if(review.user.id !== userId) throw new UnauthorizedException('삭제할 권한이 없습니다');

        await this.reviewRepository.deleteReview(review.id);
        return;
    }
}
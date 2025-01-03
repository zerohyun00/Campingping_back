import { CreateReviewDto } from "../dto/create-review.dto";
import { FindReviewParam, ParamReview } from "../dto/param-review.dto";
import { ReponseReviewDto } from "../dto/response-review.dto";
import { updateReviewDto } from "../dto/update-review.dto";

export interface IReviewService {
    createReview(createReviewDto: CreateReviewDto, userId: string): Promise<void>;
    getReview(findReviewParam: FindReviewParam): Promise<ReponseReviewDto[]>;
    updateReview(paramReview: ParamReview, updateReviewDto: updateReviewDto, userId: string): Promise<void>
    deleteReview(paramReview: ParamReview, userId: string): Promise<void>;
}
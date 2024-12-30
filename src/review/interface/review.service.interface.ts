import { CreateReviewDto } from "../dto/create-review.dto";
import { FindReviewParam, ParamReview } from "../dto/param-review.dto";
import { updateReviewDto } from "../dto/update-review.dto";

export interface IReviewService {
    createReview(createReviewDto: CreateReviewDto, userId: string): Promise<string>;
    getReview(findReviewParam: FindReviewParam): Promise<string>;
    updateReview(paramReview: ParamReview, updateReviewDto: updateReviewDto, userId: string): Promise<void>
    deleteReview(paramReview: ParamReview, userId: string): Promise<void>;
}
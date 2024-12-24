import { Review } from "../entities/review.entity";

export class ReponseReviewDto {
    id: number;
    content: string;
    contentId: string;
    scope: number;

    user:{
        email: string
        nickname: string
    }
    constructor(review: Review){
        this.id = review.id;
        this.content = review.content;
        this.contentId = review.contentId;
        this.scope = review.scope;
        this.user = {
            email: review.user.email, 
            nickname: review.user.nickname
        }
    }
    static allList(reviews: Review[]): ReponseReviewDto[]{
        return reviews.map((review) => new ReponseReviewDto(review));
    }
}
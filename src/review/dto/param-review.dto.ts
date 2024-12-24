import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class ParamReview {
    @Type(() => Number)
    @IsNumber()
    id: number;
}

export class FindReviewParam {
    @Type(() => String)
    @IsString()
    contentId: string;
}
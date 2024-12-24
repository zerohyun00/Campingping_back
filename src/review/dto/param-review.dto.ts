import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { numberValidationMessage } from "src/common/validation-message/number-validation.message";
import { stringValidationMessage } from "src/common/validation-message/string-validation.message";

export class ParamReview {
    @Type(() => Number)
    @IsNumber({}, {message: numberValidationMessage})
    id: number;
}

export class FindReviewParam {
    @Type(() => String)
    @IsString({message: stringValidationMessage})
    contentId: string;
}
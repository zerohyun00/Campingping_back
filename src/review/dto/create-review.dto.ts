import { IsNumber, IsString } from "class-validator";
import { numberValidationMessage } from "src/common/validation-message/number-validation.message";
import { stringValidationMessage } from "src/common/validation-message/string-validation.message";


export class CreateReviewDto {
    @IsString({message: stringValidationMessage})
    content: string;

    @IsNumber({}, {message: numberValidationMessage})
    scope: number;
    
    @IsString({message: stringValidationMessage})
    contentId: string;
}
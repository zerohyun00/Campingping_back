import { Type } from "class-transformer";
import { IsString } from "class-validator";
import { stringValidationMessage } from "src/common/validation-message/string-validation.message";

export class CampingParamDto {
    @IsString({message: stringValidationMessage})
    contentId: string;
}
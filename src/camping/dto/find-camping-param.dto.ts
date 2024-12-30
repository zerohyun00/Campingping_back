import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString } from "class-validator";
import { stringValidationMessage } from "src/common/validation-message/string-validation.message";

export class CampingParamDto {
    @ApiProperty({
        description: '캠핑장 contentId',
        type: String,
        example: '100000',  // 예시 값 추가
      })
    @IsString({message: stringValidationMessage})
    contentId: string;
}
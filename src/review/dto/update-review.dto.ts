import { IsNumber, IsOptional, IsString } from 'class-validator';
import { numberValidationMessage } from 'src/common/validation-message/number-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

export class updateReviewDto {
  @IsString({ message: stringValidationMessage })
  @IsOptional()
  content?: string;

  @IsNumber({}, { message: numberValidationMessage })
  @IsOptional()
  scope?: number;
}

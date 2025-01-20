import { IsNumber } from 'class-validator';
import { numberValidationMessage } from 'src/common/validation-message/number-validation.message';

export class QueryDto {
  @IsNumber({}, { message: numberValidationMessage})
  lat: number;

  @IsNumber({}, { message: numberValidationMessage })
  lon: number;
}

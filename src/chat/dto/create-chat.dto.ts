import { IsNumber, IsOptional, IsString } from 'class-validator';
import { numberValidationMessage } from 'src/common/validation-message/number-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

export class CreateChatDto {
  @IsString({ message: stringValidationMessage })
  message: string;

  @IsNumber({}, { message: numberValidationMessage })
  @IsOptional()
  room?: number;
}

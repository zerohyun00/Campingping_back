import { IsString } from 'class-validator';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

export class CreateCommentsDto {
  @IsString({ message: stringValidationMessage })
  content: string;
}

import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { booleanValidationMessage } from 'src/common/validation-message/boolean-validation.message';
import { emptyValidationMessage } from 'src/common/validation-message/empty-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

export class CreateFavoriteDto {
  @IsString({ message: stringValidationMessage })
  @IsNotEmpty({ message: emptyValidationMessage })
  contentId: string;

  @IsBoolean({ message: booleanValidationMessage })
  status: boolean;
}

import { IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { emptyValidationMessage } from 'src/common/validation-message/empty-validation.message';
import { numberValidationMessage } from 'src/common/validation-message/number-validation.message';

export class CreateCommunityDto {
  @IsString({ message: stringValidationMessage })
  @IsNotEmpty({ message: emptyValidationMessage })
  title: string;

  @IsString({ message: stringValidationMessage })
  @IsNotEmpty({ message: emptyValidationMessage })
  content: string;

  @IsString({ message: stringValidationMessage })
  location: string;

  @IsNumber({}, { message: numberValidationMessage })
  people: number;

  @IsNotEmpty({ message: emptyValidationMessage })
  @Type(() => Date)
  startDate: Date;

  @IsNotEmpty({ message: emptyValidationMessage })
  @Type(() => Date)
  endDate: Date;
}

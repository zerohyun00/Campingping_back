import { IsEmail, IsString } from 'class-validator';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

export class LoginUserDto {
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  @IsString({ message: stringValidationMessage })
  password: string;
}

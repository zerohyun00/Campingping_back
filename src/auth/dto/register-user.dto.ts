import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { emptyValidationMessage } from 'src/common/validation-message/empty-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

export class RegisterUserDto {
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  @IsNotEmpty({ message: emptyValidationMessage })
  @IsString({ message: stringValidationMessage })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password: string;

  @IsNotEmpty({ message: emptyValidationMessage })
  @IsString({ message: stringValidationMessage })
  nickname: string;
}

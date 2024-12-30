import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

export class LoginUserDto {
  @ApiProperty({
    example: 'example@example.com',
    description: '사용자의 이메일 주소',
    required: true,
  })
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  @ApiProperty({
    example: '123456',
    description: '사용자의 비밀번호',
    required: true,
  })
  @IsString({ message: stringValidationMessage })
  password: string;
}